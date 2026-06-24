/**
 * @fileoverview Sidebar alt kartı.
 * GameSkinAI hakkında kısa bilgi ve dönüştürücüye yönlendirme.
 */

import { MdAutoAwesome } from "react-icons/md";
import { Link } from "react-router-dom";

const SidebarCard = () => {
  return (
    <div className="relative mt-14 flex w-[256px] justify-center rounded-[20px] bg-gradient-to-br from-[#868CFF] via-[#432CF3] to-brand-500 pb-4">
      <div className="absolute -top-12 flex h-24 w-24 items-center justify-center rounded-full border-[4px] border-white bg-gradient-to-b from-[#868CFF] to-brand-500 dark:!border-navy-800">
        <MdAutoAwesome className="h-10 w-10 text-white" />
      </div>

      <div className="mt-16 flex h-fit flex-col items-center">
        <p className="text-lg font-bold text-white">GameSkinAI</p>
        <p className="mt-1 px-4 text-center text-sm text-white">
          Fotoğraflarınızı AI ile oyun karakterlerine dönüştürün!
        </p>

        <Link
          to="/admin/converter"
          className="text-medium mt-7 block rounded-full bg-gradient-to-b from-white/50 to-white/10 py-[12px] px-11 text-center text-base text-white hover:bg-gradient-to-b hover:from-white/40 hover:to-white/5"
        >
          Dönüştürmeye Başla
        </Link>
      </div>
    </div>
  );
};

export default SidebarCard;
