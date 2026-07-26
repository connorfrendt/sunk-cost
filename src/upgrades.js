export const DAMAGE_BONUS_AMOUNT = 30;

export const TICK_DAMAGE_AMOUNT = 5;
export const TICK_INTERVAL_MS = 1000;
export const TICK_COUNT = 5;

export const cardData = [
    {
        id: 'damage',
        title: `+${DAMAGE_BONUS_AMOUNT} DAMAGE`,
        desc: `Adds +${DAMAGE_BONUS_AMOUNT} damage per hit`,
        amount: DAMAGE_BONUS_AMOUNT,
    },
    {
        id: 'ticking',
        title: `TICKING DAMAGE`,
        desc: `On hit, deals ${TICK_DAMAGE_AMOUNT} damage per second for ${TICK_COUNT} seconds`,
    },
];