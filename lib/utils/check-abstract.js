module.exports = (instance, constructor) => {
    if (instance.constructor === constructor) {
        throw new ReferenceError(`${constructor.name} is an abstract class and cannot be instantiated`);
    }
};