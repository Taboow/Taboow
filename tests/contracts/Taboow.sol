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
//                     Taboow ERC20                         //
//                  https://taboow.org                      //
//                                                          //
//////////////////////////////////////////////////////////////

contract Token {
    function transferTokens(address to, uint256 value) public returns (bool);

}

contract Taboow_ERC20 is Ownable {

    using SafeMath for uint256;


    mapping (address => uint256) public balances;
    mapping (address => bool) public frozenAccount;
    mapping (address => bool) public verified;
    mapping (address => uint256) public reserve;
    mapping (address => bool) public owners;

    mapping (address => mapping (address => uint256)) internal allowed;

    // Public variables for the Taboow ERC20 token contract
    string public constant standard = "Taboow ERC20";
    uint256 public constant decimals = 18;   // hardcoded to be a constant
    string public name = "Taboow";
    string public symbol = "TBW";
    uint256 public totalSupply;
    address public tbwCYCaddr;

    uint256 public transactionFee = 0;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    /* This generates a public event on the blockchain that will notify clients */
    event FrozenFunds(address indexed target, bool frozen);
    event VerifiedAccount(address indexed account, bool verified);
    event ReservedTokens(address indexed account, uint256 amount);

    function balanceOf(address _owner) public view returns (uint256) {
        return balances[_owner];
    }

    function setOwners(address _addr, bool _allowed) public onlyOwner{
        owners[_addr] = _allowed;
    }

    function setTransactionFee(uint256 _value) public {
      require(owners[msg.sender] == true);

      transactionFee = _value;

    }

    function freezeAccount(address target, bool freeze) public {
        require(owners[msg.sender] == true);

        frozenAccount[target] = freeze;
        emit FrozenFunds(target, freeze);
    }

    function verifyAccount(address _addr, bool _verify) public {
        require(owners[msg.sender] == true);

        verified[_addr] = _verify;
        emit VerifiedAccount(_addr, _verify);
    }

    function reserveTokens (address _addr, uint256 _amount) public {
      require(owners[msg.sender] == true);
      require(verified[_addr]);

      reserve[_addr] = reserve[_addr].add(_amount);
      totalSupply = totalSupply.add(_amount);

      emit ReservedTokens(_addr, _amount);

    }

    function tokensDelivery (uint256 _amount, address _user) public {
      require(owners[msg.sender] == true);
      require(verified[_user]);
      require(reserve[_user] <= _amount);

      reserve[_user] = reserve[_user].sub(_amount);
      transferTokens(_user, _amount);
    }

    function setTaboowAddr(address _addr) public onlyOwner{

        delete verified[tbwCYCaddr];

        if(balances[tbwCYCaddr] > 0 ) {
            balances[_addr] = balances[tbwCYCaddr];
        } else {
          balances[_addr] = totalSupply;
        }

        delete balances[tbwCYCaddr];
        delete tbwCYCaddr;

        verified[_addr] = true;
        tbwCYCaddr = _addr;
    }

    function deleteTaboowAddr() public onlyOwner{

        delete verified[tbwCYCaddr];
        delete balances[tbwCYCaddr];
        delete tbwCYCaddr;

    }

    function transferTokens(address _to, uint256 _value) public returns(bool) {
        require(_to != address(0));
        require(!frozenAccount[msg.sender]);                     // Check if sender is frozen
        require(!frozenAccount[_to]);                       // Check if recipient is frozen
        require(verified[msg.sender]);
        require(verified[_to]);
        require(msg.sender == tbwCYCaddr || owners[msg.sender] == true);

        totalSupply = totalSupply.add(_value);
        balances[msg.sender] = balances[msg.sender].add(_value);

        // SafeMath.sub will throw if there is not enough balance.
        balances[msg.sender] = balances[msg.sender].sub(_value);

        balances[_to] = balances[_to].add(_value);

        emit Transfer(msg.sender, _to, _value);
        return true;
    }

    function transfer(address _to, uint256 _value) public returns (bool) {
        require(_to != address(0));
        require(!frozenAccount[msg.sender]);                     // Check if sender is frozen
        require(!frozenAccount[_to]);                       // Check if recipient is frozen
        require(verified[msg.sender]);
        require(verified[_to]);
        require(_value <= balances[msg.sender]);

        balances[msg.sender] = balances[msg.sender].sub(_value);

        uint256 fee = (_value * transactionFee) / 1000;

        _value = _value -fee;

        balances[_to] = balances[_to].add(_value);
        balances[owner] = balances[owner].add(fee);

        emit Transfer(msg.sender, _to, _value);
        emit Transfer(msg.sender, owner, fee);
        return true;

    }

    function transferFrom(address _from, address _to, uint256 _value) public returns (bool) {
      require(_to != address(0));
      require(_value <= balances[_from]);
      require(_value <= allowed[_from][msg.sender]);
      require(!frozenAccount[_from]);                     // Check if sender is frozen
      require(!frozenAccount[_to]);                       // Check if recipient is frozen
      require(verified[_from]);
      require(verified[_to]);

      balances[_from] = balances[_from].sub(_value);

      uint256 fee = (_value*transactionFee)/1000;

      allowed[_from][msg.sender] = allowed[_from][msg.sender].sub(_value);

      _value = _value -fee;

      balances[_to] = balances[_to].add(_value);
      balances[owner] = balances[owner].add(fee);

      emit Transfer(_from, _to, _value);
      emit Transfer(_from, owner, fee);
      return true;
    }

    function approve(address _spender, uint256 _value) public returns (bool) {
        require(verified[msg.sender]);
        require(verified[_spender]);

        allowed[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    function allowance(address _owner, address _spender) public view returns (uint256) {
        return allowed[_owner][_spender];
    }

    function increaseApproval(address _spender, uint _addedValue) public returns (bool) {
        require(verified[msg.sender]);
        require(verified[_spender]);

        allowed[msg.sender][_spender] = allowed[msg.sender][_spender].add(_addedValue);
        emit Approval(msg.sender, _spender, allowed[msg.sender][_spender]);
        return true;
    }

    function decreaseApproval(address _spender, uint _subtractedValue) public returns (bool) {
        require(verified[msg.sender]);
        require(verified[_spender]);

        uint oldValue = allowed[msg.sender][_spender];
        if (_subtractedValue > oldValue) {
            allowed[msg.sender][_spender] = 0;
        } else {
            allowed[msg.sender][_spender] = oldValue.sub(_subtractedValue);
        }
        emit Approval(msg.sender, _spender, allowed[msg.sender][_spender]);
        return true;
    }

    /* Approve and then communicate the approved contract in a single tx */
    function approveAndCall(address _spender, uint256 _value, bytes _extraData) public returns (bool success) {
        require(verified[msg.sender]);
        require(verified[_spender]);

        tokenRecipient spender = tokenRecipient(_spender);

        if (approve(_spender, _value)) {
            spender.receiveApproval(msg.sender, _value, this, _extraData);
            return true;
        }
    }
}



interface tokenRecipient {
    function receiveApproval(address _from, uint256 _value, address _token, bytes _extraData) external ;
}



contract Taboow is Taboow_ERC20 {
    //Declare logging events
    event LogDeposit(address sender, uint amount);
    event LogCoinsMinted(address deliveredTo, uint256 amount);

    //initialSupply must be equal to 5500000000000000000000000 to get 5,500,000 of tokens
    constructor (
          uint256 initialSupply
        ) public {
        totalSupply = initialSupply;
        owners[msg.sender] = true;

    }

    function mint(address _owner, uint256 _amount) public onlyOwner{
      require(verified[_owner] == true);

      balances[_owner] += _amount;
      totalSupply += _amount;
      emit LogCoinsMinted(_owner, _amount);
    }

    function sweep(address _token, uint256 _amount) public onlyOwner {
        Token token = Token(_token);

        if(!token.transferTokens(owner, _amount)) {
            revert();
        }
    }

}
