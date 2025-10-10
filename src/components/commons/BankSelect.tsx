import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export function BankSelect({ bankProvider, setBankProvider }: any) {
  return (
    <div className="space-y-2">
      <Label>Nama Bank / E-Wallet</Label>
      <Select
        value={bankProvider}
        onValueChange={(value) => setBankProvider(value)}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Pilih bank atau e-wallet" />
        </SelectTrigger>
        <SelectContent className="max-h-[200px] overflow-y-auto">
          <SelectItem value="bca">BCA</SelectItem>
          <SelectItem value="bni">BNI</SelectItem>
          <SelectItem value="bri">BRI</SelectItem>
          <SelectItem value="mandiri">Mandiri</SelectItem>
          <SelectItem value="cimb">CIMB Niaga</SelectItem>
          <SelectItem value="dana">DANA</SelectItem>
          <SelectItem value="ovo">OVO</SelectItem>
          <SelectItem value="gopay">GoPay</SelectItem>
          <SelectItem value="shopeepay">ShopeePay</SelectItem>
          <SelectItem value="linkaja">LinkAja</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
