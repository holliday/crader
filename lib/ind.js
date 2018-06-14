'use strict';

const _ = require('underscore');
const tulind = require('tulind');

root_require('core');

const ind = {};

////////////////////
ind.ohlcv = (trades, frame) => {
    var candles = [];
    if(trades.length > 0) {
        for(var time = Math.trunc(trades[0].timestamp / frame) * frame;
            time <= _.last(trades).timestamp;
            time += frame
        ) {
            var candle = trades.filter(trade => trade.timestamp >= time
                && trade.timestamp < (time + frame)
            );
            if(!candle.length) continue;

            var prices = candle.map(e => e.price);
            candles.push({
                timestamp: time,
                open:      prices[0],
                high:      Math.max(...prices),
                low:       Math.min(...prices),
                close:     _.last(prices),
                volume:    candle.map(e => e.amount).reduce((sum, val) => sum + val),
            });
        }
    }
    return candles;
}

////////////////////
// tulip indicators

function wrapper(name, ins, opts = [], outs = []) {
    var data = [];
    tulind.indicators[name].indicator(ins, opts, (err, res) => {
        if(err !== null) console.error(err);

        if(is_array(res)) {
            if(outs.length)
                outs.forEach((out, n) => {
                    if(!is_array(res[n])) return;

                    res[n].forEach((val, i) => {
                        if(!is_def(data[i])) data[i] = {};
                        data[i][out] = val;
                    });
                });
            else if(is_array(res[0])) data = res[0];
        }
    });
    return data;
}

// Vector Absolute Value
ind.abs = (series) => wrapper('abs', [series]);

// Vector Arccosine
ind.acos = (series) => wrapper('acos', [series]);

// Accumulation/Distribution Line
ind.ad = (high, low, close, volume) => wrapper('ad', [high, low, close, volume]);

// Vector Addition
ind.add = (series_1, series_2) => wrapper('add', [series_1, series_2]);

// Accumulation/Distribution Oscillator
ind.adosc = (high, low, close, volume, short_period, long_period) =>
    wrapper('adosc', [high, low, close, volume], [short_period, long_period]);

// Average Directional Movement Index
ind.adx = (high, low, close, period) =>
    wrapper('adx', [high, low, close], [period]);

// Average Directional Movement Rating
ind.adxr = (high, low, close, period) =>
    wrapper('adxr', [high, low, close], [period]);

// Awesome Oscillator
ind.ao = (high, low) => wrapper('ao', [high, low]);

// Absolute Price Oscillator
ind.apo = (series, short_period, long_period) =>
    wrapper('apo', [series], [short_period, long_period]);

// Aroon
ind.aroon = (high, low, period) =>
    wrapper('aroon', [high, low], [period], ['down', 'up']);

// Aroon Oscillator
ind.aroonosc = (high, low, period) =>
    wrapper('aroonosc', [high, low], [period]);

// Vector Arcsine
ind.asin = (series) => wrapper('asin', [series]);

// Vector Arctangent
ind.atan = (series) => wrapper('atan', [series]);

// Average True Range
ind.atr = (high, low, close, period) =>
    wrapper('atr', [high, low, close], [period]);

// Average Price
ind.avgprice = (open, high, low, close) =>
    wrapper('avgprice', [open, high, low, close]);

// Bollinger Bands
ind.bbands = (series, period, stddev) =>
    wrapper('bbands', [series], [period, stddev], ['lower', 'middle', 'upper']);

// Balance of Power
ind.bop = (open, high, low, close) =>
    wrapper('bop', [open, high, low, close]);

// Commodity Channel Index
ind.cci = (high, low, close) =>
    wrapper('cci', [high, low, close], [period]);

// Vector Ceiling
ind.ceil = (series) => wrapper('ceil', [series]);

// Chande Momentum Oscillator
ind.cmo = (series, period) => wrapper('cmo', [series], [period]);

// Vector Cosine
ind.cos = (series) => wrapper('cos', [series]);

// Vector Hyperbolic Cosine
ind.cosh = (series) => wrapper('cosh', [series]);

// Crossany
ind.crossany = (series_1, series_2) =>
    wrapper('crossany', [series_1, series_2]);

// Crossover
ind.crossover = (series_1, series_2) =>
    wrapper('crossover', [series_1, series_2]);

// Chaikins Volatility
ind.cvi = (high, low, period) => wrapper('cvi', [high, low], [period]);

// Linear Decay
ind.decay = (series, period) => wrapper('decay', [series], [period]);

// Double Exponential Moving Average
ind.dema = (series, period) => wrapper('dema', [series], [period]);

// Directional Indicator
ind.di = (high, low, close, period) =>
    wrapper('di', [high, low, close], [period], ['plus', 'minus']);

// Vector Division
ind.div = (series_1, series_2) => wrapper('div', [series_1, series_2]);

// Directional Movement
ind.dm = (high, low, period) =>
    wrapper('dm', [high, low], [period], ['plus', 'minus']);

// Detrended Price Oscillator
ind.dpo = (series, period) => wrapper('dpo', [series], [period]);

// Directional Movement Index
ind.dx = (high, low, close, period) =>
    wrapper('dx', [high, low, close], [period]);

// Exponential Decay
ind.edecay = (series, period) => wrapper('edecay', [series], [period]);

// Exponential Moving Average
ind.ema = (series, period) => wrapper('ema', [series], [period]);

// Ease of Movement
ind.emv = (high, low, volume) => wrapper('emv', [high, low, volume]);

// Vector Exponential
ind.exp = (series) => wrapper('exp', [series]);

// Fisher Transform
ind.fisher = (high, low, period) =>
    wrapper('fisher', [high, low], [period], ['fisher', 'signal']);

// Vector Floor
ind.floor = (series) => wrapper('floor', [series]);

// Forecast Oscillator
ind.fosc = (series, period) => wrapper('fosc', [series], [period]);

// Hull Moving Average
ind.hma = (series, period) => wrapper('hma', [series], [period]);

// Kaufman Adaptive Moving Average
ind.kama = (series, period) => wrapper('kama', [series], [period]);

// Klinger Volume Oscillator
ind.kvo = (high, low, close, volume, short_period, long_period) =>
    wrapper('kvo', [high, low, close, volume], [short_period, long_period]);

// Lag
ind.lag = (series, period) => wrapper('lag', [series], [period]);

// Linear Regression
ind.linreg = (series, period) => wrapper('linreg', [series], [period]);

// Linear Regression Intercept
ind.linregintercept = (series, period) =>
    wrapper('linregintercept', [series], [period]);

// Linear Regression Slope
ind.linregslope = (series, period) =>
    wrapper('linregslope', [series], [period]);

// Vector Natural Log
ind.ln = (series) => wrapper('ln', [series]);

// Vector Base-10 Log
ind.log10 = (series) => wrapper('log10', [series]);

// Moving Average Convergence/Divergence
ind.macd = (series, short_period, long_period, signal_period) =>
    wrapper('macd', [series], [short_period, long_period, signal_period],
        ['macd', 'signal', 'histogram']
    );

// Market Facilitation Index
ind.marketfi = (high, low, volume) =>
    wrapper('marketfi', [high, low, volume]);

// Mass Index
ind.mass = (high, low, period) => wrapper('mass', [high, low], [period]);

// Maximum In Period
ind.max = (series, period) => wrapper('max', [series], [period]);

// Mean Deviation Over Period
ind.md = (series, period) => wrapper('md', [series], [period]);

// Median Price
ind.medprice = (high, low) => wrapper('medprice', [high, low]);

// Money Flow Index
ind.mfi = (high, low, close, volume, period) =>
    wrapper('mfi', [high, low, close, volume], [period]);

// Minimum In Period
ind.min = (series, period) => wrapper('min', [series], [period]);

// Momentum
ind.mom = (series, period) => wrapper('mom', [series], [period]);

// Mesa Sine Wave
ind.msw = (series, period) =>
    wrapper('msw', [series], [period], ['sine', 'lead']);

// Vector Multiplication
ind.mul = (series_1, series_2) => wrapper('mul', [series_1, series_2]);

// Normalized Average True Range
ind.natr = (high, low, close, period) =>
    wrapper('natr', [high, low, close], [period]);

// Negative Volume Index
ind.nvi = (close, volume) => wrapper('nvi', [close, volume]);

// On Balance Volume
ind.obv = (close, volume) => wrapper('obv', [close, volume]);

// Percentage Price Oscillator
ind.ppo = (series, short_period, long_period) =>
    wrapper('ppo', [series], [short_period, long_period]);

// Parabolic SAR
ind.psar = (high, low, accel_step, accel_max) =>
    wrapper('psar', [high, low], [accel_step, accel_max]);

// Positive Volume Index
ind.pvi = (close, volume) => wrapper('pvi', [close, volume]);

// Qstick
ind.qstick = (open, close, period) =>
    wrapper('qstick', [open, close], [period]);

// Rate of Change
ind.roc = (series, period) => wrapper('roc', [series], [period]);

// Rate of Change Ratio
ind.rocr = (series, period) => wrapper('rocr', [series], [period]);

// Vector Round
ind.round = (series) => wrapper('round', [series]);

// Relative Strength Index
ind.rsi = (series, period) => wrapper('rsi', [series], [period]);

// Vector Sine
ind.sin = (series) => wrapper('sin', [series]);

// Vector Hyperbolic Sine
ind.sinh = (series) => wrapper('sinh', [series]);

// Simple Moving Average
ind.sma = (series, period) => wrapper('sma', [series], [period]);

// Vector Square Root
ind.sqrt = (series) => wrapper('sqrt', [series]);

// Standard Deviation Over Period
ind.stddev = (series, period) => wrapper('stddev', [series], [period]);

// Standard Error Over Period
ind.stderr = (series, period) => wrapper('stderr', [series], [period]);

// Stochastic Oscillator
ind.stoch = (high, low, close, k_period, k_slow_period, d_period) =>
    wrapper('stoch', [high, low, close], [k_period, k_slow_period, d_period],
        ['k', 'd']
    );

// Vector Subtraction
ind.sub = (series_1, series_2) => wrapper('sub', [series_1, series_2]);

// Sum Over Period
ind.sum = (series, period) => wrapper('sum', [series], [period]);

// Vector Tangent
ind.tan = (series) => wrapper('tan', [series]);

// Vector Hyperbolic Tangent
ind.tanh = (series) => wrapper('tanh', [series]);

// Triple Exponential Moving Average
ind.tema = (series, period) => wrapper('tema', [series], [period]);

// Vector Degree Conversion
ind.todeg = (series) => wrapper('todeg', [series]);

// Vector Radian Conversion
ind.torad = (series) => wrapper('torad', [series]);

// True Range
ind.tr = (high, low, close) => wrapper('tr', [high, low, close]);

// Triangular Moving Average
ind.trima = (series, period) => wrapper('trima', [series], [period]);

// Trix
ind.trix = (series, period) => wrapper('trix', [series], [period]);

// Vector Truncate
ind.trunc = (series) => wrapper('trunc', [series]);

// Time Series Forecast
ind.tsf = (series, period) => wrapper('tsf', [series], [period]);

// Typical Price
ind.typprice = (high, low, close) => wrapper('typprice', [high, low, close]);

// Ultimate Oscillator
ind.ultosc = (high, low, close, short_period, medium_period, long_period) =>
    wrapper('ultosc', [high, low, close], [short_period, medium_period, long_period]);

// Variance Over Period
ind.var = (series, period) => wrapper('var', [series], [period]);

// Vertical Horizontal Filter
ind.vhf = (series, period) => wrapper('vhf', [series], [period]);

// Variable Index Dynamic Average
ind.vidya = (series, short_period, long_period, alpha) =>
    wrapper('vidya', [series], [short_period, long_period, alpha]);

// Annualized Historical Volatility
ind.volatility = (series, period) =>
    wrapper('volatility', [series], [period]);

// Volume Oscillator
ind.vosc = (volume, short_period, long_period) =>
    wrapper('vosc', [volume], [short_period, long_period]);

// Volume Weighted Moving Average
ind.vwma = (close, volume, period) =>
    wrapper('vwma', [close, volume], [period]);

// Williams Accumulation/Distribution
ind.wad = (high, low, close) => wrapper('wad', [high, low, close]);

// Weighted Close Price
ind.wcprice = (high, low, close) => wrapper('wcprice', [high, low, close]);

// Wilders Smoothing
ind.wilders = (series, period) => wrapper('wilders', [series], [period]);

// Williams %R
ind.willr = (high, low, close, period) =>
    wrapper('willr', [high, low, close], [period]);

// Weighted Moving Average
ind.wma = (series, period) => wrapper('wma', [series], [period]);

// Zero-Lag Exponential Moving Average
ind.zlema = (series, period) => wrapper('zlema', [series], [period]);

////////////////////
module.exports = ind;
