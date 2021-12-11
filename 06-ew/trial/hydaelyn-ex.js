const storedMechanicsOutputStrings = {
    spread: Outputs.spread,
    groups: {
        en: 'Healer Groups',
    },
    stack: {
        en: 'Party Stack',
    },
};
const crystallizeOutputStrings = {
    ...storedMechanicsOutputStrings,
    crystallize: {
        en: 'Crystallize: ${name}',
    },
};
const comboOutputStrings = {
    ...storedMechanicsOutputStrings,
    combo: {
        en: '${first} => ${second}',
    },
};
Options.Triggers.push({
    zoneId: ZoneId.TheMinstrelsBalladHydaelynsCall,
    timelineFile: 'hydaelyn-ex.txt',
    timelineTriggers: [
        {
            id: 'HydaelynEx Marker Equinox',
            // There is no 8E1 effect here (maybe because it is deterministic?) so use a timeline trigger.
            regex: /Equinox/,
            beforeSeconds: 4,
            durationSeconds: (data) => data.crystallize ? 6 : 3,
            alertText: (data, _matches, output) => {
                if (data.crystallize)
                    return output.combo({ first: output.intercards(), second: output[data.crystallize]() });
                return output.intercards();
            },
            run: (data) => delete data.crystallize,
            outputStrings: {
                ...comboOutputStrings,
                intercards: {
                    en: 'Intercards',
                },
            },
        },
    ],
    triggers: [
        {
            id: 'HydaelynEx Heros\'s Radiance',
            type: 'StartsUsing',
            netRegex: NetRegexes.startsUsing({ id: '65C1', source: 'Hydaelyn', capture: false }),
            netRegexDe: NetRegexes.startsUsing({ id: '65C1', source: 'Hydaelyn', capture: false }),
            netRegexFr: NetRegexes.startsUsing({ id: '65C1', source: 'Hydaelyn', capture: false }),
            netRegexJa: NetRegexes.startsUsing({ id: '65C1', source: 'ハイデリン', capture: false }),
            netRegexCn: NetRegexes.startsUsing({ id: '65C1', source: '海德林', capture: false }),
            netRegexKo: NetRegexes.startsUsing({ id: '65C1', source: '하이델린', capture: false }),
            response: Responses.aoe(),
        },
        {
            id: 'HydaelynEx Shining Saber',
            type: 'StartsUsing',
            netRegex: NetRegexes.startsUsing({ id: '68C8', source: 'Hydaelyn', capture: false }),
            // In the final phase, there's a Shining Saber -> Crystalline Water III section.
            durationSeconds: (data) => data.crystallize ? 7 : 4,
            alertText: (data, _matches, output) => {
                if (data.crystallize)
                    return output.combo({ first: output.stack(), second: output[data.crystallize]() });
                return output.stack();
            },
            run: (data) => delete data.crystallize,
            outputStrings: comboOutputStrings,
        },
        {
            id: 'HydaelynEx Magos\'s Raidance',
            type: 'StartsUsing',
            netRegex: NetRegexes.startsUsing({ id: '65C2', source: 'Hydaelyn', capture: false }),
            response: Responses.aoe(),
        },
        {
            id: 'HydaelynEx Crystallize Water',
            type: 'Ability',
            // We could call this out on startsUsing, but no action needs to be taken for ~17 seconds,
            // and so just call this out on the action.
            netRegex: NetRegexes.ability({ id: ['659A', '6ED5'], source: 'Hydaelyn', capture: false }),
            infoText: (_data, _matches, output) => output.crystallize({ name: output.groups() }),
            run: (data) => data.crystallize = 'groups',
            outputStrings: crystallizeOutputStrings,
        },
        {
            id: 'HydaelynEx Crystallize Ice',
            type: 'Ability',
            netRegex: NetRegexes.ability({ id: ['659C', '659D'], source: 'Hydaelyn', capture: false }),
            infoText: (_data, _matches, output) => output.crystallize({ name: output.spread() }),
            run: (data) => data.crystallize = 'spread',
            outputStrings: crystallizeOutputStrings,
        },
        {
            id: 'HydaelynEx Crystallize Stone',
            type: 'Ability',
            netRegex: NetRegexes.ability({ id: ['659B', '659E'], source: 'Hydaelyn', capture: false }),
            infoText: (_data, _matches, output) => output.crystallize({ name: output.stack() }),
            run: (data) => data.crystallize = 'stack',
            outputStrings: crystallizeOutputStrings,
        },
        {
            id: 'HydaelynEx Marker Anthelion',
            type: 'GainsEffect',
            netRegex: NetRegexes.gainsEffect({ effectId: '8E1', source: 'Hydaelyn', count: '1B5', capture: false }),
            // Example timeline:
            //     t=0 StartsCasting Crystallize
            //     t=4 ActionEffect Crystalize
            //     t=7 StatusAdd 81E (this regex)
            //     t=10 marker appears
            //     t=13 ActionEffect Anthelion
            //     t=17 ActionEffect Crystalline Blizzard
            //
            // We could call this out immediately, but then it's very close to the Crystallize call.
            // Additionally, if we call this out immediately then players have to remember something
            // for 10 seconds.  A delay of 3 feels more natural in terms of time to react and
            // handle this, rather than calling it out extremely early.  Also, add a duration so that
            // this stays on screen until closer to the Crystalline action.  This also puts this call
            // closer to when the marker appears on screen, and so feels a little bit more natural.
            delaySeconds: 3,
            durationSeconds: (data) => data.crystallize ? 6 : 3,
            alertText: (data, _matches, output) => {
                if (data.crystallize)
                    return output.combo({ first: output.in(), second: output[data.crystallize]() });
                return output.in();
            },
            run: (data) => delete data.crystallize,
            outputStrings: {
                ...comboOutputStrings,
                in: Outputs.in,
            },
        },
        {
            id: 'HydaelynEx Marker Highest Holy',
            type: 'GainsEffect',
            netRegex: NetRegexes.gainsEffect({ effectId: '8E1', source: 'Hydaelyn', count: '1B4', capture: false }),
            delaySeconds: 3,
            durationSeconds: (data) => data.crystallize ? 6 : 3,
            alertText: (data, _matches, output) => {
                if (data.crystallize)
                    return output.combo({ first: output.out(), second: output[data.crystallize]() });
                return output.out();
            },
            run: (data) => delete data.crystallize,
            outputStrings: {
                ...comboOutputStrings,
                out: Outputs.out,
            },
        },
        {
            id: 'HydaelynEx Aureole',
            type: 'StartsUsing',
            netRegex: NetRegexes.startsUsing({ id: ['6C91', '6F11'], source: 'Hydaelyn', capture: false }),
            response: Responses.goSides(),
        },
        {
            id: 'HydaelynEx Lateral Aureole',
            type: 'StartsUsing',
            netRegex: NetRegexes.startsUsing({ id: ['65C5', '6F13'], source: 'Hydaelyn', capture: false }),
            response: Responses.goFrontBack(),
        },
        {
            id: 'HydaelynEx Mousa\'s Scorn',
            type: 'StartsUsing',
            netRegex: NetRegexes.startsUsing({ id: '65C0', source: 'Hydaelyn' }),
            response: Responses.sharedTankBuster(),
        },
        {
            id: 'HydaelynEx Exodus',
            type: 'Ability',
            netRegex: NetRegexes.ability({ id: '6B55', source: 'Hydaelyn', capture: false }),
            // 14.8 seconds from this ability (no cast) to 662B raidwide.
            delaySeconds: 5,
            response: Responses.aoe(),
        },
        {
            id: 'HydaelynEx Halo',
            type: 'StartsUsing',
            netRegex: NetRegexes.startsUsing({ id: '65A5', source: 'Hydaelyn', capture: false }),
            response: Responses.aoe(),
        },
        {
            id: 'HydaelynEx Radiant Halo',
            type: 'StartsUsing',
            netRegex: NetRegexes.startsUsing({ id: '6B54', source: 'Hydaelyn', capture: false }),
            response: Responses.aoe(),
        },
        {
            id: 'HydaelynEx Heros\'s Sundering',
            type: 'StartsUsing',
            netRegex: NetRegexes.startsUsing({ id: '65BF', source: 'Hydaelyn' }),
            response: Responses.tankCleave('alert'),
        },
        {
            id: 'HydaelynEx Infralateral Arc',
            type: 'StartsUsing',
            netRegex: NetRegexes.startsUsing({ id: '6669', source: 'Hydaelyn', capture: false }),
            durationSeconds: 4,
            infoText: (_data, _matches, output) => output.rolePositions(),
            outputStrings: {
                rolePositions: {
                    en: 'Role positions',
                    de: 'Rollenposition',
                    fr: 'Positions par rôle',
                    ja: 'ロール特定位置へ',
                    cn: '去指定位置',
                    ko: '1단리밋 산개위치로',
                },
            },
        },
        {
            id: 'HydaelynEx Heros\'s Glory',
            type: 'StartsUsing',
            netRegex: NetRegexes.startsUsing({ id: '65A8', source: 'Hydaelyn', capture: false }),
            response: Responses.getBehind(),
        },
        {
            id: 'HydaelynEx Parhelic Circle',
            type: 'StartsUsing',
            netRegex: NetRegexes.startsUsing({ id: '65AC', source: 'Hydaelyn', capture: false }),
            durationSeconds: 9,
            alertText: (data, _matches, output) => {
                // This is always crystallize === 'spread'.
                return output.combo({ first: output.avoid(), second: output.spread() });
            },
            run: (data) => delete data.crystallize,
            outputStrings: {
                ...comboOutputStrings,
                avoid: {
                    en: 'Avoid Line Ends',
                },
            },
        },
        {
            id: 'HydaelynEx Echoes',
            type: 'StartsUsing',
            netRegex: NetRegexes.startsUsing({ id: '65B5', source: 'Hydaelyn', capture: false }),
            infoText: (_data, _matches, output) => output.text(),
            outputStrings: {
                text: {
                    en: 'Stack 5x',
                },
            },
        },
        {
            id: 'HydaelynEx Bright Spectrum',
            type: 'StartsUsing',
            netRegex: NetRegexes.startsUsing({ id: '65B9', source: 'Hydaelyn' }),
            preRun: (data, matches) => {
 let _a; return ((_a = data.brightSpectrumStack) !== null && _a !== void 0 ? _a : (data.brightSpectrumStack = [])).push(matches.target);
},
            infoText: (data, matches, output) => {
                if (data.me === matches.target)
                    return output.spread();
            },
            outputStrings: {
                spread: Outputs.spread,
            },
        },
        {
            // In practice, this cast begins after the Bright Spectrum casts.
            id: 'HydaelynEx Dichroic Spectrum',
            type: 'StartsUsing',
            netRegex: NetRegexes.startsUsing({ id: '65B8', source: 'Hydaelyn' }),
            infoText: (data, matches, output) => {
                let _a;
                if ((_a = data.brightSpectrumStack) === null || _a === void 0 ? void 0 : _a.includes(data.me))
                    return;
                if (data.me === matches.target || data.role === 'tank')
                    return output.sharedTankbuster();
            },
            run: (data) => delete data.brightSpectrumStack,
            outputStrings: {
                sharedTankbuster: Outputs.sharedTankbuster,
            },
        },
    ],
    timelineReplace: [
        {
            'locale': 'de',
            'replaceSync': {
                'Hydaelyn': 'Hydaelyn',
                'Mystic Refulgence': 'Truglicht',
                'Parhelion': 'Parhelion',
            },
            'replaceText': {
                '--transition--': '--Übergang--',
                '--top-middle': '--Oben-Mitte',
                '--middle': '--Mitte',
                'Anthelion': 'Anthelion',
                'Aureole': 'Aureole',
                'Beacon': 'Lichtschein',
                'Bright Spectrum': 'Gleißendes Spektrum',
                'Crystalline Blizzard III': 'Kristall-Eisga',
                'Crystalline Stone III': 'Kristall-Steinga',
                'Crystalline Water/Stone III': 'Kristall-Aquaga/Steinga',
                'Crystalline Water III': 'Kristall-Aquaga',
                'Crystallize': 'Kristallisieren',
                'Dichroic Spectrum': 'Dichroitisches Spektrum',
                'Echoes': 'Echos',
                'Equinox': 'Äquinoktium',
                'Exodus': 'Exodus',
                '(?<!Radiant )Halo': 'Halo',
                'Heros\'s Glory': 'Glorie des Heros',
                'Heros\'s Radiance': 'Glanz des Heros',
                'Heros\'s Sundering': 'Schlag des Heros',
                'Highest Holy': 'Höchstes Sanctus',
                'Incandescence': 'Inkandeszenz',
                'Infralateral Arc': 'Infralateralbogen',
                'Lateral Aureole': 'Lateralaureole',
                'Light of the Crystal': 'Licht des Kristalls',
                'Lightwave': 'Lichtwoge',
                'Magos\'s Radiance': 'Glanz des Magos',
                'Mousa\'s Scorn': 'Zorn der Mousa',
                'Parhelic Circle': 'Horizontalkreis',
                '(?<!Sub)Parhelion': 'Parhelion',
                'Pure Crystal': 'Reiner Kristall',
                'Radiant Halo': 'Strahlender Halo',
                'Shining Saber': 'Strahlender Säbel',
                'Subparhelion': 'Subparhelion',
            },
        },
        {
            'locale': 'fr',
            'missingTranslations': true,
            'replaceSync': {
                'Hydaelyn': 'Hydaelyn',
                'Mystic Refulgence': 'illusion de Lumière',
                'Parhelion': 'Parhélie',
            },
            'replaceText': {
                'Anthelion': 'Anthélie',
                'Aureole': 'Auréole',
                'Beacon': 'Rayon de Lumière',
                'Bright Spectrum': 'Spectre lumineux',
                'Crystalline Blizzard III': 'Méga Glace cristallisée',
                'Crystalline Stone III': 'Méga Terre cristallisée',
                'Crystalline Water III': 'Méga Eau cristallisée',
                'Crystallize': 'Cristallisation',
                'Dichroic Spectrum': 'Spectre dichroïque',
                'Echoes': 'Échos',
                'Equinox': 'Équinoxe',
                'Exodus': 'Exode',
                '(?<!Radiant )Halo': 'Halo',
                'Heros\'s Glory': 'Gloire du héros',
                'Heros\'s Radiance': 'Radiance du héros',
                'Heros\'s Sundering': 'Fragmentation du héros',
                'Highest Holy': 'Miracle suprême',
                'Incandescence': 'Incandescence',
                'Infralateral Arc': 'Arc infralatéral',
                'Lateral Aureole': 'Auréole latérale',
                'Light of the Crystal': 'Lumière du cristal',
                'Lightwave': 'Vague de Lumière',
                'Magos\'s Radiance': 'Radiance du mage',
                'Mousa\'s Scorn': 'Mépris de la muse',
                'Parhelic Circle': 'Cercle parhélique',
                '(?<!Sub)Parhelion': 'Parhélie',
                'Pure Crystal': 'Cristal pur',
                'Radiant Halo': 'Halo radiant',
                'Shining Saber': 'Sabre de brillance',
                'Subparhelion': 'Subparhélie',
            },
        },
        {
            'locale': 'ja',
            'missingTranslations': true,
            'replaceSync': {
                'Hydaelyn': 'ハイデリン',
                'Mystic Refulgence': '幻想光',
                'Parhelion': 'パルヘリオン',
            },
            'replaceText': {
                'Anthelion': 'アントゥヘリオン',
                'Aureole': 'オーレオール',
                'Beacon': '光芒',
                'Bright Spectrum': 'ブライトスペクトル',
                'Crystalline Blizzard III': 'クリスタル・ブリザガ',
                'Crystalline Stone III': 'クリスタル・ストンガ',
                'Crystalline Water III': 'クリスタル・ウォタガ',
                'Crystallize': 'クリスタライズ',
                'Dichroic Spectrum': 'ダイクロイックスペクトル',
                'Echoes': 'エコーズ',
                'Equinox': 'エクイノックス',
                'Exodus': 'エクソダス',
                '(?<!Radiant )Halo': 'ヘイロー',
                'Heros\'s Glory': 'ヘロイスグローリー',
                'Heros\'s Radiance': 'ヘロイスラジエンス',
                'Heros\'s Sundering': 'ヘロイスサンダリング',
                'Highest Holy': 'ハイエストホーリー',
                'Incandescence': '幻閃光',
                'Infralateral Arc': 'ラテラルアーク',
                'Lateral Aureole': 'サイド・オーレオール',
                'Light of the Crystal': 'ライト・オブ・クリスタル',
                'Lightwave': 'ライトウェーブ',
                'Magos\'s Radiance': 'マゴスラジエンス',
                'Mousa\'s Scorn': 'ムーサスコーン',
                'Parhelic Circle': 'パーヘリックサークル',
                '(?<!Sub)Parhelion': 'パルヘリオン',
                'Pure Crystal': 'ピュアクリスタル',
                'Radiant Halo': 'レディアントヘイロー',
                'Shining Saber': 'シャイニングセイバー',
                'Subparhelion': 'サブパルヘリオン',
            },
        },
    ],
});
