module.exports = (definition) => 
    Object.freeze(
        Object.defineProperties({}, {
            ...Object.entries(definition).map(([key, value]) => ({
                [key]: {
                    enumerable: true,
                    value,
                },
                [value]: {
                    value: key,
                },
            }))
        })
    );