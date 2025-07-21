interface WalletAddressProps {
  address: string
  className?: string
}

export function WalletAddress({ address, className = "" }: WalletAddressProps) {
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  return <span className={`font-mono text-sm ${className}`}>{formatAddress(address)}</span>
}
