import re

with open("firestore.rules", "r") as f:
    content = f.read()

new_block = """    // Referrals collection
    match /referrals/{referralId} {
      allow read: if isAdmin() || (isAuthenticated() && resource.data.referrerId == request.auth.uid);
      allow create: if isAuthenticated() && request.resource.data.referrerId == request.auth.uid;
      allow update: if isAdmin();
      allow delete: if isAdmin();
    }

"""

# Insert before Site Stats collection
content = content.replace("    // Site Stats collection", new_block + "    // Site Stats collection")

with open("firestore.rules", "w") as f:
    f.write(content)
