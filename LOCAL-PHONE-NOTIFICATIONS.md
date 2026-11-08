# Local phone notification demonstration

Use fictional accounts only. The laptop and phone must have internet access for web push. The phone must be on the laptop's network to open FARO. Delivery depends on the browser, push provider, notification permissions, and Android battery settings; this is not an emergency alert service.

## First setup

The development certificate is generated without automatically installing a trusted root. Trusting this CA allows certificates signed with its private key to be accepted by your device. Keep `.local/https/ca/rootCA-key.pem` and `.local/https/key.pem` private. Never upload them, commit them, or send them to a phone.

1. Transfer only `.local/https/FARO-demo-CA.crt` to your Android phone, for example using USB.
2. In Android Settings, find **Install a certificate > CA certificate** (often under Security > Encryption and credentials). Read and approve the device's trust warning yourself and select this certificate. Names differ by manufacturer. Remove the FARO demo CA from user credentials after your demonstration.
3. From the FARO folder run `npm.cmd run dev:https`. HTTPS uses port 8446; the existing HTTP server on 8445 can remain running.
4. Open `https://<laptop-Wi-Fi-IP>:8446` in Android Chrome, not Messenger's embedded browser. If a certificate warning appears, stop and check that the certificate is installed and the address matches. Do not bypass the warning.
5. Sign in as a fictional student. Open Professional support and select **Enable on this device**. Approve the browser notification request yourself.
6. Leave that account signed in, close the FARO tab, and send guidance from the doctor account on the laptop. The existing HTTP doctor page uses the same database and push keys.
7. The phone should receive a generic FARO notification. Tap it to open Professional support. An expired session requires signing in again.

To stop notifications, use **Disable on this device**, sign out while connected, or revoke the site's notification permission. A shared browser has one push subscription; disable/sign out before switching students.

## If the laptop address changes

Run `powershell -File scripts/setup-demo-https.ps1 -Address YOUR_NEW_WIFI_IP` and restart the HTTPS server. The same CA is retained. Open the new HTTPS address and enable notifications there. Disable old subscriptions first when practical.

## Limits and privacy

- Generic alerts contain no names, FAS scores, or guidance text. Browser push services receive encrypted notification payloads and delivery metadata.
- Local VAPID keys and subscriptions remain in ignored `.local` storage. Subscriptions belong to authenticated students; only approved browser push-service endpoints are accepted.
- Guidance is saved even if push delivery fails. There is no durable retry queue; messages remain available in the in-app inbox.
- Closing FARO is different from signing out: signing out disables this device's subscription. Phone push needs internet even though local password login works without it.
- End-to-end phone delivery must be verified on the physical phone after certificate trust and permission are completed. This local-only implementation is not a production deployment.

References: https://github.com/FiloSottile/mkcert and https://github.com/web-push-libs/web-push
