pragma solidity 0.4.24;

/*

    Copyright 2018, Vicent Nos & Mireia Puig

    License:
    https://creativecommons.org/licenses/by-nc-nd/4.0/legalcode

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
    function transfer(address to, uint256 value) public returns (bool);
    function transferTokens(address to, uint256 value) public returns (bool);
}

contract Taboow_ERC20 is Ownable {

    using SafeMath for uint256;


    mapping (address => uint256) public balances;
    mapping (address => bool) public frozenAccount;
    mapping (address => bool) public verified;
    mapping (address => uint256) public reserve;
    mapping (address => bool) public brokers;

    mapping (address => mapping (address => uint256)) internal allowed;

    // Public variables for the Taboow ERC20 token contract
    string public constant standard = "Taboow ERC20";
    uint256 public constant decimals = 18;   // hardcoded to be a constant
    string public name = "Taboow";
    string public symbol = "TBW";
    uint256 public totalSupply;

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

    function setBrokers(address _addr, bool _allowed) public onlyOwner {
        brokers[_addr] = _allowed;
    }

    function setTransactionFee(uint256 _value) public onlyOwner{

      transactionFee = _value;

    }

    function freezeAccount(address target, bool freeze) public onlyOwner{

        frozenAccount[target] = freeze;
        emit FrozenFunds(target, freeze);
    }

    function verifyAccount(address _addr, bool _verify) public onlyOwner{

        verified[_addr] = _verify;
        emit VerifiedAccount(_addr, _verify);
    }

    function reserveTokens (address _addr, uint256 _amount) public {
      require(brokers[msg.sender] == true);
      require(verified[_addr]);

      reserve[_addr] = reserve[_addr].add(_amount);
      totalSupply = totalSupply.add(_amount);

      emit ReservedTokens(_addr, _amount);

    }

    function withdrawTokens (address _addr, uint256 _amount) public {
      require(brokers[msg.sender] == true);
      require(verified[_addr]);

      reserve[_addr] = reserve[_addr].sub(_amount);

      emit ReservedTokens(_addr, _amount);

    }

    function transferTokens(address _to, uint256 _value) public returns(bool) {
        require(_to != address(0));
        require(_value <= balances[msg.sender]);
        require(!frozenAccount[msg.sender]);                     // Check if sender is frozen
        require(!frozenAccount[_to]);                       // Check if recipient is frozen
        require(verified[_to] == true || brokers[_to] == true);
        require(brokers[msg.sender] == true);

        balances[msg.sender] = balances[msg.sender].sub(_value);

        balances[_to] = balances[_to].add(_value);

        emit Transfer(msg.sender, _to, _value);
        return true;
    }

    function transfer(address _to, uint256 _value) public returns (bool) {
        require(_to != address(0));
        require(_value <= balances[msg.sender]);
        require(!frozenAccount[msg.sender]);                     // Check if sender is frozen
        require(!frozenAccount[_to]);                       // Check if recipient is frozen
        require(verified[msg.sender] == true);
        require(verified[_to] == true);

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
      require(_value <= allowed[_from][msg.sender]);
      require(!frozenAccount[_from]);                     // Check if sender is frozen
      require(!frozenAccount[_to]);                       // Check if recipient is frozen
      require(verified[_from]);
      require(verified[_to]);
      require(_value <= balances[_from]);

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

    constructor (
          uint256 initialSupply,
          address contractOwner
        ) public {
        totalSupply = initialSupply;
        brokers[contractOwner] = true;
        owner = contractOwner;
        balances[contractOwner] = initialSupply;

    }

    function mint(address _owner, uint256 _amount) public onlyOwner{

      balances[_owner] += _amount;
      totalSupply += _amount;
      emit LogCoinsMinted(_owner, _amount);
    }

    function sweep(address _token, uint256 _amount) public onlyOwner {
        Token token = Token(_token);

        if(!token.transfer(owner, _amount)) {
            revert();
        }
    }

}
