
import React from 'react';
import { GoogleMapsIcon } from '../icons/GuideIcons';

interface OfflineInstructionModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const OfflineInstructionModal: React.FC<OfflineInstructionModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200 font-['Inter'] print:hidden">
            <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6 relative animate-in zoom-in-95 duration-200">
                <div className="flex flex-col items-center text-center">
                    <div className="bg-green-50 p-4 rounded-full mb-4">
                        <GoogleMapsIcon className="w-10 h-10" />
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Don't forget the map!</h3>
                    <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                        You've saved the guide, but links won't work without internet. We recommend downloading this area in Google Maps.
                    </p>

                    <div className="w-full bg-gray-50 rounded-xl p-4 text-left text-xs text-gray-600 mb-6 space-y-2 border border-gray-100">
                        <p className="font-semibold text-gray-800 mb-1">How to save offline map:</p>
                        <div className="flex gap-2">
                            <span className="font-bold text-gray-400">1.</span>
                            <span>Open <strong>Google Maps</strong> app</span>
                        </div>
                        <div className="flex gap-2">
                            <span className="font-bold text-gray-400">2.</span>
                            <span>Tap your profile picture</span>
                        </div>
                        <div className="flex gap-2">
                            <span className="font-bold text-gray-400">3.</span>
                            <span>Select <strong>Offline maps</strong></span>
                        </div>
                        <div className="flex gap-2">
                            <span className="font-bold text-gray-400">4.</span>
                            <span>Tap <strong>Select your own map</strong></span>
                        </div>
                    </div>

                    <button 
                        onClick={onClose}
                        className="w-full py-3 bg-black text-white font-bold rounded-xl active:scale-95 transition-transform"
                    >
                        Got it
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OfflineInstructionModal;
