import networkTypes from './networkTypes';

const networkInfo = {
  [`${networkTypes.mainnet}`]: {
    balance_checker_contract_address: null,
    disabled: false,
    faucet_url: null,
    name: 'Mainnet',
    uniswap_supported: true,
    value: networkTypes.mainnet,
  },
  [`${networkTypes.ropsten}`]: {
    balance_checker_contract_address:
      '0xf17adbb5094639142ca1c2add4ce0a0ef146c3f9',
    disabled: false,
    faucet_url: `http://faucet.metamask.io/`,
    name: 'Ropsten',
    uniswap_supported: false,
    value: networkTypes.ropsten,
  },
  [`${networkTypes.kovan}`]: {
    balance_checker_contract_address:
      '0xf3352813b612a2d198e437691557069316b84ebe',
    disabled: false,
    faucet_url: `https://faucet.kovan.network/`,
    name: 'Kovan',
    uniswap_supported: false,
    value: networkTypes.kovan,
  },
  [`${networkTypes.rinkeby}`]: {
    balance_checker_contract_address:
      '0xc55386617db7b4021d87750daaed485eb3ab0154',
    disabled: false,
    faucet_url: 'https://faucet.rinkeby.io/',
    name: 'Rinkeby',
    uniswap_supported: true,
    value: networkTypes.rinkeby,
  },
  [`${networkTypes.goerli}`]: {
    balance_checker_contract_address:
      '0xf3352813b612a2d198e437691557069316b84ebe',
    disabled: false,
    faucet_url: 'https://goerli-faucet.slock.it/',
    name: 'Goerli',
    uniswap_supported: false,
    value: networkTypes.goerli,
  },
};

export default networkInfo;
