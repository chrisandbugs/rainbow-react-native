import {
  getAccountENS,
  getNativeCurrency,
  getNetwork,
  saveAccountENS,
  saveLanguage,
  saveNativeCurrency,
  saveNetwork,
} from '../handlers/localstorage/globalSettings';
import { web3Provider, web3SetHttpProvider } from '../handlers/web3';
import networkTypes from '../helpers/networkTypes';
import { updateLanguage } from '../languages';

import { ethereumUtils, logger } from '../utils';
import { dataResetState } from './data';
import { explorerClearState, explorerInit } from './explorer';

// -- Constants ------------------------------------------------------------- //

const SETTINGS_UPDATE_SETTINGS_ADDRESS =
  'settings/SETTINGS_UPDATE_SETTINGS_ADDRESS';
const SETTINGS_UPDATE_SETTINGS_COLOR =
  'settings/SETTINGS_UPDATE_SETTINGS_COLOR';
const SETTINGS_UPDATE_SETTINGS_ENS = 'settings/SETTINGS_UPDATE_SETTINGS_ENS';
const SETTINGS_UPDATE_SETTINGS_NAME = 'settings/SETTINGS_UPDATE_SETTINGS_NAME';
const SETTINGS_UPDATE_NATIVE_CURRENCY_SUCCESS =
  'settings/SETTINGS_UPDATE_NATIVE_CURRENCY_SUCCESS';
const SETTINGS_UPDATE_LANGUAGE_SUCCESS =
  'settings/SETTINGS_UPDATE_LANGUAGE_SUCCESS';
const SETTINGS_UPDATE_NETWORK_SUCCESS =
  'settings/SETTINGS_UPDATE_NETWORK_SUCCESS';

// -- Actions --------------------------------------------------------------- //
export const settingsLoadState = () => async dispatch => {
  try {
    const nativeCurrency = await getNativeCurrency();
    dispatch({
      payload: nativeCurrency,
      type: SETTINGS_UPDATE_NATIVE_CURRENCY_SUCCESS,
    });
  } catch (error) {
    logger.log('Error loading native currency', error);
  }

  try {
    const accountENS = await getAccountENS();
    dispatch({
      payload: accountENS,
      type: SETTINGS_UPDATE_SETTINGS_ENS,
    });
  } catch (error) {
    logger.log('Error loading account ENS', error);
  }
};

export const settingsLoadNetwork = () => async dispatch => {
  try {
    const network = await getNetwork();
    const chainId = ethereumUtils.getChainIdFromNetwork(network);
    await web3SetHttpProvider(network);
    dispatch({
      payload: { chainId, network },
      type: SETTINGS_UPDATE_NETWORK_SUCCESS,
    });
  } catch (error) {
    logger.log('Error loading network settings', error);
  }
};

export const settingsUpdateAccountName = accountName => dispatch =>
  dispatch({
    payload: { accountName },
    type: SETTINGS_UPDATE_SETTINGS_NAME,
  });

export const settingsUpdateAccountColor = accountColor => dispatch =>
  dispatch({
    payload: { accountColor },
    type: SETTINGS_UPDATE_SETTINGS_COLOR,
  });

export const settingsUpdateAccountAddress = accountAddress => async dispatch => {
  dispatch({
    payload: accountAddress,
    type: SETTINGS_UPDATE_SETTINGS_ADDRESS,
  });
  dispatch(settingsResolveAccountENS(accountAddress));
};

const settingsResolveAccountENS = accountAddress => async (
  dispatch,
  getState
) => {
  const { accountENS: existingAccountENS } = getState().settings;
  try {
    const accountENS = await web3Provider.lookupAddress(accountAddress);
    dispatch({
      payload: accountENS,
      type: SETTINGS_UPDATE_SETTINGS_ENS,
    });
    if (accountENS !== existingAccountENS) {
      saveAccountENS(accountENS);
    }
  } catch (error) {
    logger.log('Error finding ens', error);
  }
};

export const settingsUpdateNetwork = network => async dispatch => {
  const chainId = ethereumUtils.getChainIdFromNetwork(network);
  await web3SetHttpProvider(network);
  try {
    dispatch({
      payload: { chainId, network },
      type: SETTINGS_UPDATE_NETWORK_SUCCESS,
    });
    saveNetwork(network);
  } catch (error) {
    logger.log('Error updating network settings', error);
  }
};

export const settingsChangeLanguage = language => async dispatch => {
  updateLanguage(language);
  try {
    dispatch({
      payload: language,
      type: SETTINGS_UPDATE_LANGUAGE_SUCCESS,
    });
    saveLanguage(language);
  } catch (error) {
    logger.log('Error changing language', error);
  }
};

export const settingsChangeNativeCurrency = nativeCurrency => async dispatch => {
  dispatch(dataResetState());
  dispatch(explorerClearState());
  try {
    dispatch({
      payload: nativeCurrency,
      type: SETTINGS_UPDATE_NATIVE_CURRENCY_SUCCESS,
    });
    dispatch(explorerInit());
    saveNativeCurrency(nativeCurrency);
  } catch (error) {
    logger.log('Error changing native currency', error);
  }
};

// -- Reducer --------------------------------------------------------------- //
export const INITIAL_STATE = {
  accountAddress: '',
  accountColor: 6,
  accountENS: null,
  accountName: '',
  chainId: 1,
  language: 'en',
  nativeCurrency: 'USD',
  network: networkTypes.mainnet,
};

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case SETTINGS_UPDATE_SETTINGS_ADDRESS:
      return {
        ...state,
        accountAddress: action.payload,
      };
    case SETTINGS_UPDATE_SETTINGS_ENS:
      return {
        ...state,
        accountENS: action.payload,
      };
    case SETTINGS_UPDATE_SETTINGS_NAME:
      return {
        ...state,
        accountName: action.payload.accountName,
      };
    case SETTINGS_UPDATE_SETTINGS_COLOR:
      return {
        ...state,
        accountColor: action.payload.accountColor,
      };
    case SETTINGS_UPDATE_NATIVE_CURRENCY_SUCCESS:
      return {
        ...state,
        nativeCurrency: action.payload,
      };
    case SETTINGS_UPDATE_NETWORK_SUCCESS:
      return {
        ...state,
        chainId: action.payload.chainId,
        network: action.payload.network,
      };
    case SETTINGS_UPDATE_LANGUAGE_SUCCESS:
      return {
        ...state,
        language: action.payload,
      };
    default:
      return state;
  }
};
