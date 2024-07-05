import Long from "long";

/**
 * 位运算或
 * @param numbers 数字
 */
function bitwiseOr(...numbers: (Long | string | number)[]) {
    let number = Long.fromValue(numbers[0]);
    for (let i = 1; i < numbers.length; i++) {
        number = number.or(Long.fromValue(numbers[i]));
    }
    return number;
}

let globalSnowflake: undefined | SnowflakeWorker = undefined

/**
 * 雪花 ID 生成器，需自行处理生成器对象唯一性，因为不同的对象生成的 id 可能会有重复，或者调用静态方法 global 以获取全局雪花对象
 */
export default class SnowflakeWorker {
    /**
     * 机器ID
     */
    workerId: number = 0;
    /**
     * 数据中心ID
     */
    dataCenterId: number = 0;
    /**
     * 序列号
     */
    sequence: number = 0;
    lastTimestamp: number = -1;
    /**
     * 开始时间戳
     */
    startTimestamp: number = 1288834974657;
    /**
     * 机器ID占用的位数
     */
    workerIdBits: number = 5;
    /**
     * 数据中心ID占用的位数
     */
    datacenterIdBits: number = 5;
    maxWorkerId: number;
    /**
     * 序列号占用的位数
     */
    sequenceBits: number = 12;
    /**
     * 机器ID偏移
     */
    workerIdShift: number = 12;
    /**
     * 时间戳左移
     */
    timestampLeftShift: number;
    /**
     * 序列号掩码
     */
    sequenceMask: number;
    timeOffset: number = 2000;

    constructor(workerId?: number, dataCenterId?: number) {
        if (workerId) {
            this.workerId = workerId;
        }
        if (dataCenterId) {
            this.dataCenterId = dataCenterId;
        }
        // 最大机器ID，结果是31 (这个移位算法可以很快的计算出几位的二进制数最大是多少)
        this.maxWorkerId = -1 ^ (-1 << this.workerIdBits);

        // 时间戳左移22位(5+5+12)
        this.timestampLeftShift = this.sequenceBits + this.workerIdBits + this.datacenterIdBits;

        // 序列号掩码，这里为4095 (0b111111111111=4095)
        this.sequenceMask = -1 ^ (-1 << this.sequenceBits);
    }

    /**
     * 获取全局雪花对象
     * @param workerId 机器ID
     * @param dataCenterId 数据中心ID
     */
    static global(workerId?: number, dataCenterId?: number) {
        if (globalSnowflake) return globalSnowflake
        return new SnowflakeWorker(workerId, dataCenterId)
    }

    _tilNextMillis(lastTimestamp: number) {
        let timestamp = this._timeGen();
        while (timestamp <= lastTimestamp) {
            timestamp = this._timeGen();
        }
        return timestamp;
    }

    _timeGen() {
        return Date.now();
    }

    /**
     * 获取下一个雪花 ID
     */
    nextId() {
        let timestamp = this._timeGen();

        if (timestamp < this.lastTimestamp) {
            if (this.lastTimestamp - timestamp >= this.timeOffset) {
                throw new Error('Clock moved backwards. Refusing to generate id for ' + (this.lastTimestamp - timestamp))
            }
            timestamp = this.lastTimestamp;
        }

        if (this.lastTimestamp === timestamp) {
            let sequence = (this.sequence + 1) & this.sequenceMask;
            if (this.sequence === 0) {
                timestamp = this._tilNextMillis(this.lastTimestamp);
            }
            this.sequence = sequence;
        } else {
            this.sequence = 0;
        }

        this.lastTimestamp = timestamp;
        // 由于低版本js高位数会丢失精度，所以采用高精度计算
        const timestampLong = Long.fromValue(timestamp - this.startTimestamp).shiftLeft(this.timestampLeftShift);
        const dataCenterLong = Long.fromValue(this.dataCenterId).shiftLeft(this.workerIdBits + this.sequenceBits);
        const workerLong = Long.fromValue(this.workerId).shiftLeft(this.workerIdShift);
        return bitwiseOr(timestampLong.toString(), dataCenterLong.toString(), workerLong.toString(), this.sequence).toString();
    }
}
