import re

with open("test_script.js", "r") as f:
    content = f.read()

content = content.replace(
    'import { collection, query, orderBy, getDocs, updateDoc, doc, deleteDoc, where } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";',
    'import { collection, query, orderBy, getDocs, updateDoc, doc, deleteDoc, where, getDoc, addDoc, serverTimestamp, increment } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";'
)

search = """                    } else if (action === 'complete') {
                        await updateDoc(doc(db, "bookings", id), { status: 'completed' });
                        statusCell.innerHTML = `<span class="status-badge active">completed</span>`;
                        actionCell.innerHTML = ``;

                        // Update metrics optimistically
                        const el = document.getElementById('upcoming-bookings');
                        el.textContent = Math.max(0, parseInt(el.textContent) - 1);
                    }"""

replace = """                    } else if (action === 'complete') {
                        const bookingRef = doc(db, "bookings", id);
                        const bookingSnap = await getDoc(bookingRef);
                        const bookingData = bookingSnap.data();

                        await updateDoc(bookingRef, { status: 'completed' });

                        // Process referral if exists
                        if (bookingData && bookingData.referralCode) {
                            try {
                                const q = query(collection(db, "users"), where("referralCode", "==", bookingData.referralCode));
                                const userSnap = await getDocs(q);
                                if (!userSnap.empty) {
                                    const referrerId = userSnap.docs[0].id;
                                    await updateDoc(doc(db, "users", referrerId), {
                                        referralCredits: increment(25)
                                    });
                                    await addDoc(collection(db, "referrals"), {
                                        referrerId: referrerId,
                                        refereeId: bookingData.userId,
                                        bookingId: id,
                                        status: 'completed',
                                        createdAt: serverTimestamp()
                                    });
                                    console.log("Applied $25 referral credit to user: " + referrerId);
                                }
                            } catch (e) {
                                console.error("Error applying referral credits:", e);
                            }
                        }

                        statusCell.innerHTML = `<span class="status-badge active">completed</span>`;
                        actionCell.innerHTML = ``;

                        // Update metrics optimistically
                        const el = document.getElementById('upcoming-bookings');
                        el.textContent = Math.max(0, parseInt(el.textContent) - 1);
                    }"""

content = content.replace(search, replace)

with open("test_script.js", "w") as f:
    f.write(content)
