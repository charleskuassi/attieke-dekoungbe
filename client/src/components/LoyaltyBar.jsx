import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Star } from 'lucide-react';

const LoyaltyBar = () => {
    const { user } = useContext(AuthContext);

    if (!user) return null;

    const points = user.loyaltyPoints || 0;
    const nextReward = 500;
    const progress = Math.min((points / nextReward) * 100, 100);

    return (
        <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl shadow-sm border border-orange-100 dark:border-orange-800 mb-6 transition-colors">
            <div className="flex justify-between items-center mb-2">
                <div className="flex items-center text-orange-600 dark:text-orange-400 font-bold">
                    <Star className="mr-2 fill-current" size={20} />
                    <span>Mes Grains d'Or : {points} pts</span>
                </div>
                <span className="text-xs text-orange-500 dark:text-orange-300 font-semibold">
                    {points >= nextReward ? "Récompense débloquée !" : `Plus que ${nextReward - points} pts pour un cadeau !`}
                </span>
            </div>
            <div className="w-full bg-orange-200 dark:bg-orange-900/50 rounded-full h-2.5">
                <div
                    className="bg-orange-500 dark:bg-orange-400 h-2.5 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
        </div>
    );
};

export default LoyaltyBar;
