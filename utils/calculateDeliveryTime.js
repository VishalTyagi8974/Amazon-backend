module.exports = (lat1, lon1, lat2, lon2) => {
    // Function to calculate the distance between two coordinates using Haversine formula
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Radius of Earth in kilometers
        const toRadians = (degrees) => (degrees * Math.PI) / 180;

        const dLat = toRadians(lat2 - lat1);
        const dLon = toRadians(lon2 - lon1);

        const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRadians(lat1)) *
            Math.cos(toRadians(lat2)) *
            Math.sin(dLon / 2) ** 2;

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // Distance in kilometers
    };

    // Calculate the distance between the points
    const distance = calculateDistance(lat1, lon1, lat2, lon2);

    // Determine delivery time based on distance
    let deliveryTime; // Delivery time in days
    if (distance <= 100) {
        deliveryTime = 2; // Delivery time for <= 100 km
    } else if (distance <= 200) {
        deliveryTime = 3; // Delivery time for <= 200 km
    } else {
        deliveryTime = Math.ceil(distance / 100) + 1; // Delivery time for > 200 km
    }

    // Calculate the estimated delivery date
    const currentDate = new Date(); // Current date
    const estimatedDeliveryDate = new Date(
        currentDate.getTime() + deliveryTime * 24 * 60 * 60 * 1000
    ); // Add delivery time in milliseconds

    return {
        estimatedDeliveryDate: estimatedDeliveryDate.toDateString(), // Human-readable format
    };
};