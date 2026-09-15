import re

with open("firestore.rules", "r") as f:
    content = f.read()

search = """    // Referrals collection
    match /referrals/{referralId} {
      allow read: if isAdmin() || (isAuthenticated() && resource.data.referrerId == request.auth.uid);
      allow create: if isAuthenticated() && request.resource.data.referrerId == request.auth.uid;
      allow update: if isAdmin();
      allow delete: if isAdmin();
    }"""

replace = """    // Referrals collection
    match /referrals/{referralId} {
      allow read: if isAdmin() || (isAuthenticated() && resource.data.referrerId == request.auth.uid);
      allow create: if isAdmin();
      allow update: if isAdmin();
      allow delete: if isAdmin();
    }"""

content = content.replace(search, replace)

with open("firestore.rules", "w") as f:
    f.write(content)
