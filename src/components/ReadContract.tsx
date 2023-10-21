'use client'

import * as PushAPI from '@pushprotocol/restapi';
import { ethers } from 'ethers';
import { useEffect } from 'react';
import { BaseError } from 'viem';
import { useAccount, useContractRead, useWalletClient } from 'wagmi';

import { tokenPayMasterContractConfig } from './contracts';

export function ReadContract() {
  return (
    <div>
      <div>
        <BalanceOf />
      </div>
    </div>
  )
}

function BalanceOf() {
  const { address } = useAccount()
  const { data: signer } = useWalletClient()

  const { data, error, isSuccess } = useContractRead({
    ...tokenPayMasterContractConfig,
    functionName: 'paymasterIdBalances',
    args: [address!],
    enabled: Boolean(address),
  })

  const env: any = 'staging'
  let balance = '0'

  if (data != undefined) {
    balance = ethers.utils.formatEther(data!.toString())
  }

  useEffect(() => {
    const init = async() => {
      const channelData = await PushAPI.channels.getChannel({
        channel: `eip155:5:0xef902bbE4967ac7A5Ec22039cA2d994325A36dB9`, 
        env: env
      });
      console.log("channelData:", channelData)
    }
    init()
  }, [])

  useEffect(() => {
    // send notificate
    const sendNotificate = async() => {
      const apiResponse = await PushAPI.payloads.sendNotification({
        signer,
        type: 3, 
        identityType: 2, 
        notification: {
          title: `[FRKT] TokenPaymaster's balance is very low!!`,
          body: `[FRKT] TokenPaymaster's balance is very low!! Please deposit!!`
        },
        payload: {
          title: `[FRKT] TokenPaymaster's balance is very low!!`,
          body: `[FRKT] TokenPaymaster's balance is very low!! Please deposit!!`,
          cta: '',
          img: ''
        },
        recipients: `eip155:5:${address}`, 
        channel: 'eip155:5:0xef902bbE4967ac7A5Ec22039cA2d994325A36dB9', 
        env: env
      });
      console.log('apiResponse:', apiResponse)
    }

    if(Number(balance) <= 0.005) {
      sendNotificate()
    }
  }, [balance])

  // TODO add send notification logic

  return (
    <div>
      balance: {isSuccess && balance} ETH
      {error && <div>{(error as BaseError).shortMessage}</div>}
    </div>
  )
}
