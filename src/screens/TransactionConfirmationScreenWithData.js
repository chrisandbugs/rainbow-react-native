import { getTransactionCount, web3Instance } from 'balance-common';
import lang from 'i18n-js';
import { get } from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { AlertIOS, StatusBar, Vibration } from 'react-native';
import Piwik from 'react-native-matomo';
import { withTransactionConfirmationScreen } from '../hoc';
import { sendTransaction } from '../model/wallet';
import { walletConnectSendTransactionHash } from '../model/walletconnect';
import TransactionConfirmationScreen from './TransactionConfirmationScreen';

class TransactionConfirmationScreenWithData extends Component {
  static propTypes = {
    accountUpdateHasPendingTransaction: PropTypes.func,
    accountUpdateTransactions: PropTypes.func,
    navigation: PropTypes.any,
    removeTransaction: PropTypes.func,
    transactionCountNonce: PropTypes.number,
    updateTransactionCountNonce: PropTypes.func,
    walletConnectors: PropTypes.object,
  }

  componentDidUpdate = (prevProps) => {
    if (this.props.isScreenActive && !prevProps.isScreenActive) {
      Piwik.trackScreen('TxnConfirmScreen', 'TxnConfirmScreen');
    }
  }

  componentDidMount() {
    StatusBar.setBarStyle('light-content', true);
    Vibration.vibrate();
  }

  handleConfirmTransaction = async () => {
    const { transactionDetails } = this.props.navigation.state.params;
    const txPayload = transactionDetails.callData;
    const web3TxnCount = await getTransactionCount(txPayload.from);
    const maxTxnCount = Math.max(this.props.transactionCountNonce, web3TxnCount);
    const nonce = web3Instance.utils.toHex(maxTxnCount);
    const txPayloadLatestNonce = { ...txPayload, nonce };
    const symbol = get(transactionDisplayDetails, 'asset.symbol', 'unknown');
    const address = get(transactionDisplayDetails, 'asset.address', '');
    const trackingName = `${symbol}:${address}`;
    const transactionHash = await sendTransaction({
      tracking: {
        action: 'send-wc',
        amount: get(transactionDisplayDetails, 'nativeAmount'),
        name: trackingName,
      },
      transaction: txPayloadLatestNonce
    });

    if (transactionHash) {
      this.props.updateTransactionCountNonce(maxTxnCount + 1);
      const txDetails = {
        asset: get(transactionDetails, 'transactionDisplayDetails.asset'),
        from: get(transactionDetails, 'transactionDisplayDetails.from'),
        gasLimit: get(transactionDetails, 'transactionDisplayDetails.gasLimit'),
        gasPrice: get(transactionDetails, 'transactionDisplayDetails.gasPrice'),
        hash: transactionHash,
        nonce: get(transactionDetails, 'transactionDisplayDetails.nonce'),
        to: get(transactionDetails, 'transactionDisplayDetails.to'),
        value: get(transactionDetails, 'transactionDisplayDetails.value'),
      };
      this.props.accountUpdateHasPendingTransaction();
      this.props.accountUpdateTransactions(txDetails);
      this.props.removeTransaction(transactionDetails.callId);
      const walletConnector = this.props.walletConnectors[transactionDetails.sessionId];
      await walletConnectSendTransactionHash(walletConnector, transactionDetails.callId, true, transactionHash);
      this.closeTransactionScreen();
    } else {
      await this.handleCancelTransaction();
    }
  };

  sendFailedTransactionStatus = async () => {
    try {
      this.closeTransactionScreen();
      const { transactionDetails } = this.props.navigation.state.params;
      const walletConnector = this.props.walletConnectors[transactionDetails.sessionId];
      await walletConnectSendTransactionHash(walletConnector, transactionDetails.callId, false, null);
    } catch (error) {
      this.closeTransactionScreen();
      AlertIOS.alert(lang.t('wallet.transaction.alert.cancelled_transaction'));
    }
  }

  handleCancelTransaction = async () => {
    try {
      await this.sendFailedTransactionStatus();
      const { transactionDetails } = this.props.navigation.state.params;
      this.props.removeTransaction(transactionDetails.callId);
    } catch (error) {
      this.closeTransactionScreen();
      AlertIOS.alert('Failed to send rejected transaction status');
    }
  }

  closeTransactionScreen = () => {
    StatusBar.setBarStyle('dark-content', true);
    this.props.navigation.goBack();
  }

  render = () => {
    const {
      transactionDetails: {
        dappName,
        transactionDisplayDetails: {
          asset,
          nativeAmountDisplay,
          to,
          value,
        },
      },
    } = this.props.navigation.state.params;

    return (
      <TransactionConfirmationScreen
        asset={{
          address: to,
          amount: value || '0.00',
          dappName: dappName || '',
          name: asset.name || 'No data',
          nativeAmountDisplay,
          symbol: asset.symbol || 'N/A',
        }}
        onCancelTransaction={this.handleCancelTransaction}
        onConfirmTransaction={this.handleConfirmTransaction}
      />
    );
  }
}

export default withTransactionConfirmationScreen(TransactionConfirmationScreenWithData);
