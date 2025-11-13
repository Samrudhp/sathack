# Quick Setup Guide

## 1. Start Backend

```bash
cd E:\Sagar\Hackathons and Competitions\SatHack\backend
python run.py
```

Make sure it shows: `INFO:     Application startup complete.`

## 2. Seed Recycler Credentials

Open a NEW terminal:

```bash
cd E:\Sagar\Hackathons and Competitions\SatHack\backend
python scripts\seed_recycler_creds.py
```

You should see:
```
✅ Created credentials:
   Username: recycler1
   Password: password123
```

## 3. Open Recycler Dashboard

Just open this file in your browser:
```
E:\Sagar\Hackathons and Competitions\SatHack\frontend-v3\index.html
```

OR use Live Server / local server:
```bash
cd E:\Sagar\Hackathons and Competitions\SatHack\frontend-v3
python -m http.server 3000
# Then open http://localhost:3000
```

## 4. Login

- Username: `recycler1`
- Password: `password123`

## Troubleshooting

### "Failed to fetch"
- Make sure backend is running on `http://localhost:8000`
- Check console for actual error
- Try opening `http://localhost:8000/docs` to verify backend is up

### "Invalid credentials"
- Run `seed_recycler_creds.py` again
- Check MongoDB is running
- Try username: `recycler1`, password: `password123`

### Need User ID for testing
- Open frontend-v2 and go to Profile page
- OR use the default test user: `673fc7f4f1867ab46b0a8c01`
