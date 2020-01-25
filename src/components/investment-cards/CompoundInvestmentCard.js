// import React, {useState, useEffect} from 'react';
// import PropTypes from 'prop-types';
// import { floor } from 'lodash';
// import { withProps, withHandlers, compose } from 'recompact';
// import { withOpenInvestmentCards, withAccountSettings, withAccountData } from '../../hoc';
// import { Text } from '../text';
// import InvestmentCard from './InvestmentCard';
// import { colors } from '../../styles';
// import { graphql } from '@apollo/client';
// import {
//   COMPOUND_DAI_ACCOUNT_TOKEN_QUERY,
//   COMPOUND_USDC_ACCOUNT_TOKEN_QUERY,
// } from '../../apollo/queries';

// import BigNumber from 'bignumber.js';
// import AnimateNumber from '@bankify/react-native-animate-number';

// /*
//   TODO:
//    - Convert graphQL HoCs to useSavingsAccount hook
//    - Finish animating number for DAI/USDC supply rates
//    - Clean  up the component
//    - Look into moving enhance up a level so that we can use hooks inside of these functions
// */

// const CompoundInvestmentCardHeight = 114;

// const AssetLabel = withProps({
//   color: 'blueGreyDarkTransparent',
//   lineHeight: 'tight',
//   size: 'smedium',
// })(Text);

// const CompoundInvestmentCard = ({
//   accountCToken,
//   isCollapsible,
//   nativeCurrency,
//   onPress,
//   onPressContainer,
//   openInvestmentCards,
//   ...props
// }) => {
//   const {
//     cTokenBalance,
//     lifetimeSupplyInterestAccrued,
//     market: { exchangeRate, supplyRate },
//   } = accountCToken;

//   console.log('accountCToken', accountCToken);
//   console.log(`props `, props)
//   const interestRate = BigNumber(supplyRate / 2104400).toString();
//   //const val = `${(Number(accountCToken.cTokenBalance) * Number(exchangeRate))}`
//   const val = `$${ (Number(cTokenBalance) * exchangeRate).toFixed(2) } $${ Number(lifetimeSupplyInterestAccrued).toFixed(8) }`
//   console.log('interest rate ', interestRate)

//   return (
//     <InvestmentCard
//       {...props}
//       containerHeight={CompoundInvestmentCard.height}
//       flex={0}
//       headerProps={{
//         color: colors.limeGreen,
//         emoji: 'money_mouth_face',
//         value: (
//           <AnimateNumber
//             value={cTokenBalance}
//             countBy={interestRate}
//             timing={(interval = 1, progress) => {
//               console.log('progress', progress);
//               return interval * (1 - Math.sin(Math.PI * interestRate)) * 10;
//             }}
//           />
//         ),
//       }}
//       height={CompoundInvestmentCardHeight}
//       isExpandedState={!onPress}
//     />
//   );
// };

// CompoundInvestmentCard.propTypes = {
//   accountCToken: PropTypes.object,
//   nativeCurrency: PropTypes.string,
//   onPress: PropTypes.func,
//   onPressContainer: PropTypes.func,
// };

// export default compose(
//   withAccountData,
//   withAccountSettings,
//   withOpenInvestmentCards,
//   graphql(COMPOUND_USDC_ACCOUNT_TOKEN_QUERY, {
//     //options: (props) => ({ variables: { addr: `0x39aa39c021dfbae8fac545936693ac917d5e7563-${props.accountAddress.toLocaleLowerCase('en')}` }}),
//     props: ({ data }) => {
//       console.log('usdc ', data);
//       return data;
//     },
//   }),
//   graphql(COMPOUND_DAI_ACCOUNT_TOKEN_QUERY, {
//     //options: (props) => ({ variables: { addr: `0xf5dce57282a584d2746faf1593d3121fcac444dc-${props.accountAddress.toLocaleLowerCase('en')}` }}),
//     props: ({ data }) => {
//       console.log('dai ', data);
//       return data;
//     },
//   }),
//   withHandlers({
//     onPressContainer: ({ item, onPress }) => () => {
//       if (onPress) {
//         onPress(item);
//       }
//     },
//   })
// )(CompoundInvestmentCard);
