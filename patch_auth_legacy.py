import re

with open("js/auth.js", "r") as f:
    content = f.read()

search = """        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            return userDoc.data();
        } else {"""
replace = """        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            let data = userDoc.data();
            if (!data.referralCode) {
                const referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
                await setDoc(userDocRef, { referralCode: referralCode, referralCredits: 0 }, { merge: true });
                data.referralCode = referralCode;
                data.referralCredits = 0;
            }
            return data;
        } else {"""

content = content.replace(search, replace)

with open("js/auth.js", "w") as f:
    f.write(content)
