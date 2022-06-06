// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/IERC1155MetadataURI.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "./royalties/ContractRoyalties.sol";


contract CarbonBits is Ownable, ERC2981ContractRoyalties, IERC1155MetadataURI, ERC1155  {
    
    bytes4 private constant _INTERFACE_ID_ERC2981 = 0x2a55205a;
    address public ROYALTIESADDRESS = owner(); 
    uint256 public ROYALTIESPOINTS = 1000; //10%
    
    //Token config.
    mapping (uint => string) public locator;
    mapping (uint256 => uint256) public currentTokenSupply;
    mapping (uint256 => uint256) public tokenPrice;
    mapping (uint256 => uint256) public maxTokensPerId;
    mapping (uint256 => uint256) public maxTokensPerAddress;
    mapping(uint256 => bool) public tokenExists;
    
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    event newNFTMinted(address, uint256);

    constructor() ERC1155("CarbonBits") {
        setRoyalties(ROYALTIESADDRESS, ROYALTIESPOINTS);
    }

    modifier callerIsUser() {
    require(tx.origin == msg.sender, "The caller is another contract");
    _;
  }
    
    /// @dev contract level metadata for Opensea
    function contractURI() public pure returns (string memory) {
        return "ipfs://some_CID_pointing_to_a_file_in_IPFS";
    }

    function setPricePerId(uint256 _newPrice, uint256 _tokenId) public onlyOwner {
        tokenPrice[_tokenId] = _newPrice;
    }
    
    function setRoyaltiesAddress(address _newAddress) public onlyOwner {
        ROYALTIESADDRESS = _newAddress;
    }

    function setRoyaltiesPoints(uint96 _newRoyaltiesPoints) public onlyOwner {
        //measured in basic points 10% = 1000, 5% = 500
        ROYALTIESPOINTS = _newRoyaltiesPoints;
    }

    function setMaxTokensPerId(uint256 _id, uint256 _newMaxTokensPerId) public onlyOwner {
        maxTokensPerId[_id] = _newMaxTokensPerId;
    }
    
    function setMaxTokensPerAddress(uint256 _id, uint256 _newMaxTokensPerAddress) public onlyOwner {
        maxTokensPerAddress[_id] = _newMaxTokensPerAddress;
    }

    function uri(uint256 _id) public view override(ERC1155, IERC1155MetadataURI) returns (string memory)
    {
        return string(abi.encodePacked('ipfs://', locator[_id]));
    }
    
    function mapIdToLocator(uint _tokenId, string memory locale) internal {
        locator[_tokenId] = locale;
    }

    /// @dev Creation of a new Token by owner
    /// @param account. If @param amount is non-zero, 
    ///the token will be created and minted in the same transaction to this address
    ///@param _price price for this tokenId
    ///@param _maxTokensPerId max number of mintable tokens for any given tokenId
    ///@param _maxTokensPerAddress max numbers of this tokenId that any given address is allowed to own
    ///@param data, additional data. Can be empty using "0x"
    ///@param givenURL IPFS CID address.
    function createNewToken(address account, uint256 amount, uint256 _price, uint256 _maxTokensPerId, uint256 _maxTokensPerAddress, 
    bytes memory data, string memory givenURL) public onlyOwner returns (uint256) {

        //This part creates the token, amount is initial supply and goes to the minter (Owner)
        _tokenIds.increment();
        uint256 id = _tokenIds.current();
        _mint(account, id, amount, data);

        //This mapping sets the relation tokenId => Price. We can control each tokens price individually. Parameter units is ether. 
        tokenPrice[id] = _price;

        //auxiliary info, total token supply per id, id to url and max tokens per id.
        currentTokenSupply[id] = amount;
        mapIdToLocator(id, givenURL);
        maxTokensPerId[id] = _maxTokensPerId;
        maxTokensPerAddress[id] = _maxTokensPerAddress;
        tokenExists[id] = true;
        
        return id;
    }

    ///@dev this is the function that the user interacts with
    ///@notice mints a previously created Token
    ///@param data if this parameter was created empty, we need to call the function with "0x"
    function mintToUser(uint256 id, uint256 _amount, bytes memory data) public payable callerIsUser returns (uint256) {
        require(tokenExists[id] == true, "Token Id does not exist");
        uint256 _price = tokenPrice[id];

        //NFT mint validation
        require(msg.value == _amount * _price, "Not enough/too much ether sent");
        require(getTotalSupplyByTokenId(id) + _amount <= maxTokensPerId[id], "Not enough tokens left in the collection");
        require(balanceOf(msg.sender, id) + _amount <= maxTokensPerAddress[id], "Cannot mint more tokens with the same address");

        
        _mint(msg.sender, id, _amount, data);

        currentTokenSupply[id] += _amount;
        
        emit newNFTMinted(msg.sender, id);
        
        return id;
    }

    function getCurrentId() external view returns(uint256){
        return _tokenIds.current();
    }

    function getTotalSupplyByTokenId(uint256 _tokenId) public view returns(uint256){
        uint256 currentNFTsMinted = currentTokenSupply[_tokenId];
        return currentNFTsMinted;
    }

     function supportsInterface(bytes4 interfaceId) public view virtual override(ERC1155, IERC165, ERC2981Base)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    /// @dev Sets token royalties
    /// @param recipient recipient of the royalties
    /// @param value percentage (using 2 decimals - 10000 = 100, 0 = 0)
    function setRoyalties(address recipient, uint256 value) public {
        _setRoyalties(recipient, value);
    }

    /// @dev retrieve all the funds obtained during minting
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;

        require(balance > 0, "No funds left to withdraw");

        (bool sent, ) = payable(owner()).call{value: balance}("");
        require(sent, "Failed to send Ether");
    }

    receive() external payable {
        revert();
    }

}