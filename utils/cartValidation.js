module.exports = (cart) => {
    if (cart.length === 0) {
        return [];
    }
    return cart.map((item) => {
        if (!item.product || !item.quantity) {
            throw new Error('Invalid cart item: missing product or quantity');
        }

        if (item.quantity < 1 || !Number.isInteger(item.quantity)) {
            throw new Error('Invalid cart item: quantity must be a positive integer');
        }

        // Ensure product is in the correct format if needed (e.g., an ObjectId in MongoDB)
        return {
            product: item.product,
            quantity: item.quantity,
        };
    });
};
