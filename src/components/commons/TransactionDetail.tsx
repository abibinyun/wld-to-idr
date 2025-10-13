import { useState } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const TransactionDetails = ({
  wldAmount,
  receivedAmount,
  bankName,
  bankProvider,
  bankAccount,
  proofUrl,
  showTransactionDetails,
  setShowTransactionDetails,
}) => {
  const [isImageOpen, setIsImageOpen] = useState(false);

  return (
    <>
      {/* Tombol Detail Transaksi (Sticky di bawah chat) */}
      <div className="p-4 bg-cyber-bg-secondary flex gap-2 border-t border-cyber-border-default sticky bottom-0 z-10">
        <Button
          onClick={() => setShowTransactionDetails(!showTransactionDetails)}
          className="w-fit text-cyber-text-primary hover:bg-cyber-bg-primary border-2 border-cyan-700"
          size="sm"
        >
          {showTransactionDetails ? "Tutup Detail" : "Detail Transaksi"}
        </Button>
      </div>

      {/* Popup Card untuk Detail Transaksi */}
      {showTransactionDetails && (
        <div className="fixed inset-0 flex justify-center items-center z-50 p-4 pt-12">
          <div className="w-full max-w-xl bg-cyber-bg-secondary shadow-2xl shadow-2xl shadow-cyan-500/20 rounded-lg border border-cyber-border-default p-6 space-y-4">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-cyber-text-primary">
                Detail Transaksi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* WLD in */}
              <div className="flex justify-between text-sm text-cyber-text-muted">
                <p className="font-medium">WLD in:</p>
                <p className="font-semibold text-cyber-text-primary">
                  {wldAmount}
                </p>
              </div>

              {/* Received Amount */}
              <div className="flex justify-between text-sm text-cyber-text-muted">
                <p className="font-medium">Received:</p>
                <p className="font-semibold text-cyber-text-primary">
                  {receivedAmount != null
                    ? new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                      }).format(receivedAmount)
                    : "Loading..."}
                </p>
              </div>

              {/* Bank Name */}
              <div className="flex justify-between text-sm text-cyber-text-muted">
                <p className="font-medium">Bank Name:</p>
                <p className="font-semibold text-cyber-text-primary">
                  {bankName}
                </p>
              </div>

              {/* From: Bank Provider & Account */}
              <div className="flex justify-between text-sm text-cyber-text-muted">
                <p className="font-medium">Payment to:</p>
                <p className="font-semibold text-cyber-text-primary">
                  {bankProvider} {bankAccount}
                </p>
              </div>

              {/* Proof URL */}
              {proofUrl && (
                <div className="flex justify-between text-sm text-cyber-text-muted">
                  <p className="font-medium">Proof:</p>
                  <div
                    className="w-20 h-20 overflow-hidden rounded-lg cursor-pointer border border-cyber-border-default hover:border-cyber-accent-primary transition-colors"
                    onClick={() => setIsImageOpen(true)}
                  >
                    <Image
                      src={proofUrl}
                      alt="Bukti Transfer"
                      width={100}
                      height={100}
                      className="object-cover"
                    />
                  </div>
                </div>
              )}
            </CardContent>

            {/* Close Button */}
            <div className="flex justify-end">
              <Button
                size={"sm"}
                onClick={() => setShowTransactionDetails(false)}
                className="p-2 w-4 mt-4 bg-cyber-accent-primary hover:bg-cyber-accent-hover text-white font-bold py-3 px-8 rounded-lg text-lg shadow-lg shadow-glow-cyan-important transition-all duration-300 transform hover:scale-105"
              >
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Image */}
      <Dialog open={isImageOpen} onOpenChange={setIsImageOpen}>
        <DialogContent className="max-w-md pt-3 bg-cyber-bg-secondary border-cyber-border-default">
          <DialogTitle className="text-xl text-center text-cyber-text-primary pt-4">
            Bukti Transfer
          </DialogTitle>
          <div className="flex justify-center p-4">
            <div className="max-h-[70vh] overflow-auto">
              <Image
                src={proofUrl}
                alt="Bukti Transfer"
                className="object-contain rounded-lg"
                width={400}
                height={600}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TransactionDetails;
