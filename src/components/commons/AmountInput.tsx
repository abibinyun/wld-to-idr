export default function AmountInput({ withdrawAmount, setWithdrawAmount }) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    const isValid = /^\d*\.?\d*$/.test(value);

    if (value === "" || isValid) {
      setWithdrawAmount(value);
    }
  };

  return (
    <input
      required
      type="text"
      inputMode="decimal"
      value={withdrawAmount}
      onChange={handleChange}
      placeholder="Masukkan jumlah WLD"
      className="w-full bg-cyber-bg-primary text-cyber-text-primary border-cyber-border-default focus:border-cyber-accent-primary px-4 py-2 rounded-md"
    />
  );
}
