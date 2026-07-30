export const DAMAGE_BONUS_AMOUNT = 10;

export const TICK_DAMAGE_AMOUNT = 5;
export const TICK_INTERVAL_MS = 1000;
export const TICK_COUNT = 5;

export const LIFE_DRAIN_PERCENT = 0.10;

export const THORNS_PERCENT = 0.5;

export const GLASS_CANNON

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
        id: 'glasscannon',
        title: 'GLASS CANNON',
        desc: 'Deal twice the damage, but ',
        applyTo: (target) => console.log(target),
    },
    {
        id: 'shuriken',
        title: 'SHURIKEN',
        desc: 'Throw a shuriken at your foes (Press "C")',
        applyTo: (target) => target.enableShuriken(),
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
        desc: `Reflect ${THORNS_PERCENT * 100}% of damage taken back at attackers`,
        applyTo: (target) => target.enableThorns(THORNS_PERCENT),
    },
];