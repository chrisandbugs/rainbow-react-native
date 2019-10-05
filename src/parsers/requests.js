import { convertHexToUtf8 } from '@walletconnect/utils';
import BigNumber from 'bignumber.js';
import { get } from 'lodash';
import { isHexString } from '../handlers/web3';
import {
  convertAmountAndPriceToNativeDisplay,
  convertHexToString,
  convertRawAmountToDecimalFormat,
  fromWei,
} from '../helpers/utilities';
import smartContractMethods from '../references/smartcontract-methods.json';
import { ethereumUtils } from '../utils';
import {
  PERSONAL_SIGN,
  SEND_TRANSACTION,
  SIGN,
  SIGN_TRANSACTION,
  SIGN_TYPED,
  SIGN_TYPED_V3,
} from '../utils/signingMethods';

export const getRequestDisplayDetails = (payload, assets, nativeCurrency) => {
  let timestampInMs = Date.now();
  if (payload.id) {
    timestampInMs = getTimestampFromPayload(payload);
  }
  if (
    payload.method === SEND_TRANSACTION ||
    payload.method === SIGN_TRANSACTION
  ) {
    const transaction = get(payload, 'params[0]', null);
    return getTransactionDisplayDetails(
      transaction,
      assets,
      nativeCurrency,
      timestampInMs
    );
  }
  if (payload.method === SIGN) {
    const message = get(payload, 'params[1]');
    const result = getMessageDisplayDetails(message, timestampInMs);
    return result;
  }
  if (payload.method === PERSONAL_SIGN) {
    let message = get(payload, 'params[0]');
    try {
      if (isHexString(message)) {
        message = convertHexToUtf8(message);
      }
    } catch (error) {
      // TODO error handling
    }
    return getMessageDisplayDetails(message, timestampInMs);
  }
  if (payload.method === SIGN_TYPED || payload.method === SIGN_TYPED_V3) {
    const request = get(payload, 'params[1]', null);
    const jsonRequest = JSON.stringify(request.message);
    return getMessageDisplayDetails(jsonRequest, timestampInMs);
  }
  return {};
};

const getMessageDisplayDetails = (message, timestampInMs) => ({
  request: message,
  timestampInMs,
});

const getTransactionDisplayDetails = (
  transaction,
  assets,
  nativeCurrency,
  timestampInMs
) => {
  const tokenTransferHash = smartContractMethods.token_transfer.hash;
  if (transaction.data === '0x') {
    const value = fromWei(convertHexToString(transaction.value));
    const asset = ethereumUtils.getAsset(assets);
    const priceUnit = get(asset, 'price.value', 0);
    const { amount, display } = convertAmountAndPriceToNativeDisplay(
      value,
      priceUnit,
      nativeCurrency
    );
    return {
      request: {
        asset,
        from: transaction.from,
        gasLimit: BigNumber(convertHexToString(transaction.gasLimit)),
        gasPrice: BigNumber(convertHexToString(transaction.gasPrice)),
        nativeAmount: amount,
        nativeAmountDisplay: display,
        nonce: Number(convertHexToString(transaction.nonce)),
        to: transaction.to,
        value,
      },
      timestampInMs,
    };
  }
  if (transaction.data.startsWith(tokenTransferHash)) {
    const contractAddress = transaction.to;
    const asset = ethereumUtils.getAsset(assets, contractAddress);
    const dataPayload = transaction.data.replace(tokenTransferHash, '');
    const toAddress = `0x${dataPayload.slice(0, 64).replace(/^0+/, '')}`;
    const amount = `0x${dataPayload.slice(64, 128).replace(/^0+/, '')}`;
    const value = convertRawAmountToDecimalFormat(
      convertHexToString(amount),
      asset.decimals
    );
    const priceUnit = get(asset, 'price.value', 0);
    const native = convertAmountAndPriceToNativeDisplay(
      value,
      priceUnit,
      nativeCurrency
    );
    return {
      request: {
        asset,
        from: transaction.from,
        gasLimit: BigNumber(convertHexToString(transaction.gasLimit)),
        gasPrice: BigNumber(convertHexToString(transaction.gasPrice)),
        nativeAmount: native.amount,
        nativeAmountDisplay: native.display,
        nonce: Number(convertHexToString(transaction.nonce)),
        to: toAddress,
        value,
      },
      timestampInMs,
    };
  }
  if (transaction.data) {
    const value = transaction.value
      ? fromWei(convertHexToString(transaction.value))
      : 0;
    return {
      request: {
        data: transaction.data,
        from: transaction.from,
        gasLimit: BigNumber(convertHexToString(transaction.gasLimit)),
        gasPrice: BigNumber(convertHexToString(transaction.gasPrice)),
        nonce: Number(convertHexToString(transaction.nonce)),
        to: transaction.to,
        value,
      },
      timestampInMs,
    };
  }

  return null;
};

const getTimestampFromPayload = payload =>
  parseInt(payload.id.toString().slice(0, -3), 10);