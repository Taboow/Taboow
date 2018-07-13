pragma solidity 0.4.24;

/*
    Copyright 2018, Vicent Nos & Mireia Puig

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.

*/


 /**
  * @title OpenZeppelin SafeMath
  * @dev Math operations with safety checks that throw on error
  */
  library SafeMath {

   /**
   * @dev Multiplies two numbers, throws on overflow.
   */
   function mul(uint256 a, uint256 b) internal pure returns (uint256 c) {
     // Gas optimization: this is cheaper than asserting 'a' not being zero, but the
     // benefit is lost if 'b' is also tested.
     // See: https://github.com/OpenZeppelin/openzeppelin-solidity/pull/522
     if (a == 0) {
       return 0;
     }

     c = a * b;
     assert(c / a == b);
     return c;
   }

   /**
   * @dev Integer division of two numbers, truncating the quotient.
   */
   function div(uint256 a, uint256 b) internal pure returns (uint256) {
     // assert(b > 0); // Solidity automatically throws when dividing by 0
     // uint256 c = a / b;
     // assert(a == b * c + a % b); // There is no case in which this doesn't hold
     return a / b;
   }

   /**
   * @dev Subtracts two numbers, throws on overflow (i.e. if subtrahend is greater than minuend).
   */
   function sub(uint256 a, uint256 b) internal pure returns (uint256) {
     assert(b <= a);
     return a - b;
   }

   /**
   * @dev Adds two numbers, throws on overflow.
   */
   function add(uint256 a, uint256 b) internal pure returns (uint256 c) {
     c = a + b;
     assert(c >= a);
     return c;
   }
 }


 /**
  * @title OpenZeppelin Ownable
  * @dev The Ownable contract has an owner address, and provides basic authorization control
  * functions, this simplifies the implementation of "user permissions".
  */
 contract Ownable {
   address public owner;

   event OwnershipRenounced(address indexed previousOwner);
   event OwnershipTransferred(
     address indexed previousOwner,
     address indexed newOwner
   );

   /**
    * @dev The Ownable constructor sets the original `owner` of the contract to the sender
    * account.
    */
   constructor() public {
     owner = msg.sender;
   }

   /**
    * @dev Throws if called by any account other than the owner.
    */
   modifier onlyOwner() {
     require(msg.sender == owner);
     _;
   }

   /**
    * @dev Allows the current owner to relinquish control of the contract.
    * @notice Renouncing to ownership will leave the contract without an owner.
    * It will not be possible to call the functions with the `onlyOwner`
    * modifier anymore.
    */
   function renounceOwnership() public onlyOwner {
     emit OwnershipRenounced(owner);
     owner = address(0);
   }

   /**
    * @dev Allows the current owner to transfer control of the contract to a newOwner.
    * @param _newOwner The address to transfer ownership to.
    */
   function transferOwnership(address _newOwner) public onlyOwner {
     _transferOwnership(_newOwner);
   }

   /**
    * @dev Transfers control of the contract to a newOwner.
    * @param _newOwner The address to transfer ownership to.
    */
   function _transferOwnership(address _newOwner) internal {
     require(_newOwner != address(0));
     emit OwnershipTransferred(owner, _newOwner);
     owner = _newOwner;
   }
 }


//////////////////////////////////////////////////////////////
//                                                          //
//                    TaboowERC20 CYC                       //
//                   https://taboow.org                     //
//                                                          //
//////////////////////////////////////////////////////////////

contract Token {
    function transferTokens(address to, uint256 value) public returns (bool);
    function transfer(address to, uint256 value) public returns (bool);
    function verified(address _addr) public pure returns (bool _status);
    function reserveTokens (address _addr, uint256 _amount) public;
    function reserve(address _addr) public pure returns (uint256 _amount);
    function tokensDelivery (uint256 _amount, address _user) public;

}

contract Taboow_CYC is Ownable {

    using SafeMath for uint256;

    string public name = "Taboow CYC";      // Extended name of this contract
    uint256 public tokenPrice = 0;        // Set the fixed ESS token price
    address public FWDaddrETH;            // Set the address to forward the received ETH to
    address public taboowAddr;            // Set the ESSENTIA Genesis contract address
    uint256 public totalSold;             // Keep track of the contributions total
    uint256 public decimals = 18;         // The decimals to consider

    mapping (address => uint256) public sold;       // Map the ESS token allcations

    uint256 public pubEnd = 0;                      // Set the unixtime END for the public engagement
    address contractAddr = this;                      // Better way to point to this from this

    // Constant to simplify the conversion of token amounts into integer form
    uint256 public tokenUnit = uint256(10)**decimals;

    /* Initializes contract with initial supply tokens to the creator of the contract */
    constructor(
            address addrEth,
            address addrTaboow

        ) public {
          FWDaddrETH = addrEth;
          taboowAddr = addrTaboow;
    }

    function () public payable {
      buy();  // Allow to buy tokens sending ETH directly to the contract, fallback
    }

    function setFWDaddrETH(address _value) public onlyOwner {
      FWDaddrETH = _value;     // Set the forward address default toETHaddr

    }


    function setTaboow(address _value) public onlyOwner {
      taboowAddr = _value;     // Set the ERC20 Taboow contract address default taboowAddr

    }

    function setPrice(uint256 _value) public onlyOwner {
      tokenPrice = _value;     // Set the token price default 0

    }

    function setPubEnd(uint256 _value) public onlyOwner {
      pubEnd = _value;         // Set the END of the public engagement unixtime default 0

    }

    function buy() public payable {

        require(block.timestamp < pubEnd);          // Require the current unixtime to be lower than the END unixtime
        require(msg.value > 0);                     // Require the sender to send an ETH tx higher than 0
        require(msg.value <= msg.sender.balance + msg.value);   // Require the sender to have sufficient ETH balance for the tx

        require(Token(taboowAddr).verified(msg.sender) == true);

        // Calculate the amount of tokens per contribution
        uint256 tokenAmount = (msg.value * tokenUnit) / tokenPrice;

        // Requiring sufficient token balance on this contract to accept the tx

        transferBuy(msg.sender, tokenAmount);       // Instruct the accounting function
        totalSold = totalSold.add(msg.value);       // Account for the total contributed/sold
        FWDaddrETH.transfer(msg.value);             // Forward the ETH received to the external address

    }

    function withdrawPUB() public returns(bool) {

        require(block.timestamp > pubEnd);          // Require the PE to be over - actual time higher than end unixtime
        require(sold[msg.sender] > 0);              // Require the ESS token balance to be sent to be higher than 0

        // Send ESS tokens to the contributors proportionally to their contribution/s
        if(!taboowAddr.call(bytes4(keccak256("transferTokens(address,uint256)")), msg.sender, sold[msg.sender])){revert();}

        delete sold[msg.sender];
        return true;

    }

    function transferBuy(address _to, uint256 _value) internal returns (bool) {

        require(_to != address(0));                 // Require the destination address being non-zero

        sold[_to] = sold[_to].add(_value);            // Account for multiple txs from the same address

        return true;

    }

    function EMGwithdraw(uint256 weiValue) external onlyOwner {
        require(block.timestamp > pubEnd);          // Require the public engagement to be over
        require(weiValue > 0);                      // Require a non-zero value

        FWDaddrETH.transfer(weiValue);              // Transfer to the external ETH forward address
    }

    function isVerified (address _addr) public view returns (bool) {
      return Token(taboowAddr).verified(_addr);
    }

    function isReserved (address _addr) public view returns (uint256) {
      return Token(taboowAddr).reserve(_addr);
    }

    function sweep(address _token, uint256 _amount) public onlyOwner {
        Token token = Token(_token);

        if(!token.transferTokens(owner, _amount)) {
            revert();
        }
    }

    function reserveTokens (address _addr, uint256 _amount) public {
        require(Token(taboowAddr).verified(msg.sender) == true);
        require(Token(taboowAddr).verified(_addr) == true);

        if(!taboowAddr.call(bytes4(keccak256("reserveTokens(address,uint256)")), _addr, _amount)){revert();}
    }

    function tokensDelivery (uint256 _amount, address _user) public {
        require(Token(taboowAddr).verified(msg.sender) == true);
        require(Token(taboowAddr).verified(_user) == true);

        if(!taboowAddr.call(bytes4(keccak256("tokensDelivery(uint256,address)")), _amount, _user)){revert();}
    }

}
