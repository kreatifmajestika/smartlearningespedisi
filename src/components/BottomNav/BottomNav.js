import { FaHome, FaClipboardList, FaCubes, FaImages } from "react-icons/fa";

const BottomNav = () => {
  return (
    <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-300 flex justify-center py-2">
      <div className="max-w-xs w-full flex justify-around">
        <div className="flex flex-col items-center text-gray-700">
          <FaHome size={20} />
          <span className="text-xs">Beranda</span>
        </div>
        <div className="flex flex-col items-center text-gray-700">
          <FaClipboardList size={20} />
          <span className="text-xs">Latihan</span>
        </div>
      </div>
    </div>
  );
};

export default BottomNav;
