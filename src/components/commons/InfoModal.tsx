import React, { useState } from "react";
import CustomModal from "./CustomModal";
import { CircleQuestionMark } from "lucide-react";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";

const InfoModal = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div>
      <button
        onClick={openModal}
        className="group relative p-1 rounded-full bg-cyber-accent-primary text-cyber-bg-primary shadow-glow-cyan transition-all duration-300 transform hover:scale-110"
      >
        <CircleQuestionMark className="w-4 h-4" />
      </button>

      <CustomModal
        open={isModalOpen}
        onClose={closeModal}
        title="Mendapatkan Alamat Pengirim"
      >
        {/* Konten modal di sini */}
        <p className="text-cyber-text-muted leading-relaxed">
          Alamat ini digunakan untuk memverifikasi siapa yang mengirim token
          kepada sistem kami. Sistem kami secara otomatis akan memeriksa apakah
          token telah berhasil diterima berdasarkan alamat yang diberikan.
          Pastikan alamat yang Anda masukkan benar untuk memastikan transaksi
          dapat diproses dengan lancar dan tanpa kesalahan.
        </p>

        <div className="mt-4">
          <p className="text-cyber-text-primary font-semibold">
            Berikut adalah petunjuk untuk mendapatkan alamat dompet Anda.
          </p>

          <Separator className="bg-cyber-border-default" />

          <div className="flex flex-col space-y-4 mt-4">
            <div className="relative w-full h-auto">
              <h2 className="font-bold mb-2 text-cyber-text-primary">Step 1</h2>
              <p className="text-cyber-text-muted">
                Buka aplikasi World App. dan klik Pengaturan di pojok kanan
                atas.
              </p>
              <Image
                src="/assets/how-to-get-wallet-address/step-1.webp"
                layout="responsive"
                width={1200}
                height={800}
                alt="step-1"
                className="object-contain w-full border-2 border-cyber-border-default rounded-xl mt-2"
              />
            </div>

            <div className="relative w-full h-auto">
              <h2 className="font-bold mb-2 text-cyber-text-primary">Step 2</h2>
              <p className="text-cyber-text-muted">
                Silahkan pilih menu "Dompent" dan klik menu tersebut.
              </p>
              <Image
                src="/assets/how-to-get-wallet-address/step-2.webp"
                layout="responsive"
                width={1200}
                height={800}
                alt="step-2"
                className="object-contain w-full border-2 border-cyber-border-default rounded-xl mt-2"
              />
            </div>

            <div className="relative w-full h-auto">
              <h2 className="font-bold mb-2 text-cyber-text-primary">Step 3</h2>
              <p className="text-cyber-text-muted">
                Silakan klik pada alamat tersebut.
              </p>
              <Image
                src="/assets/how-to-get-wallet-address/step-3.webp"
                layout="responsive"
                width={1200}
                height={800}
                alt="step-3"
                className="object-contain w-full border-2 border-cyber-border-default rounded-xl mt-2"
              />
            </div>

            <div className="relative w-full h-auto">
              <h2 className="font-bold mb-2 text-cyber-text-primary">Step 4</h2>
              <p className="text-cyber-text-muted">
                Klik tombol "Oke, salin alamat aku"
              </p>
              <Image
                src="/assets/how-to-get-wallet-address/step-4.webp"
                layout="responsive"
                width={1200}
                height={800}
                alt="step-4"
                className="object-contain w-full border-2 border-cyber-border-default rounded-xl mt-2"
              />
            </div>

            <div className="relative w-full h-auto">
              <h2 className="font-bold mb-2 text-cyber-text-primary">Step 5</h2>
              <p className="text-cyber-text-muted">
                Setelah selesai, tutup jendela ini dan lakukan "paste" (tekan
                dan tahan, lalu pilih opsi <strong>Tempel</strong>) pada kolom
                "Alamat Pengirim".
              </p>
            </div>
          </div>
        </div>
      </CustomModal>
    </div>
  );
};

export default InfoModal;
