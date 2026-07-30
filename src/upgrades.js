export const DAMAGE_BONUS_AMOUNT = 10;

export const TICK_DAMAGE_AMOUNT = 5;
export const TICK_INTERVAL_MS = 1000;
export const TICK_COUNT = 5;

export const LIFE_DRAIN_PERCENT = 0.25;

export const cardData = [
    {
        id: 'damage',
        title: `+${DAMAGE_BONUS_AMOUNT} DAMAGE`,
        desc: `Adds +${DAMAGE_BONUS_AMOUNT} damage per hit`,
        amount: DAMAGE_BONUS_AMOUNT,
        applyTo: (target) => target.addBonusDamage(DAMAGE_BONUS_AMOUNT),
    },
    {
        id: 'ticking',
        title: `TICKING DAMAGE`,
        desc: `On hit, deals ${TICK_DAMAGE_AMOUNT} damage per second for ${TICK_COUNT} seconds`,
        applyTo: (target) => target.enableTickingDamage(),
    },
    {
        id: 'dash',
        title: 'DASH',
        desc: 'DASH PH',
        applyTo: (target) => console.log(target),
    },
    {
        id: 'fireball',
        title: 'FIREBALL',
        desc: 'FIREBALL PH',
        applyTo: (target) => console.log(target),
    },
    {
        id: 'lifedrain',
        title: 'LIFE DRAIN',
        desc: `Heal ${LIFE_DRAIN_PERCENT * 100}% of damage dealt`,
        applyTo: (target) => target.enableLifeDrain(LIFE_DRAIN_PERCENT),
    },
    {
        id: 'thorns',
        title: 'THORNS',
        desc: 'Enemies that strike you take damage in return',
        applyTo: (target) => console.log(target),
    },
];