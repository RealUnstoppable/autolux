import { db } from './auth.js';
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

import { submitDetailingRequest as utilSubmit } from './utils.js';
export async function submitDetailingRequest(bookingData) {
    // Assuming bookingData has userId, if not, we pass null and it will fail unless modified
    return await utilSubmit(bookingData.userId, bookingData);
}
