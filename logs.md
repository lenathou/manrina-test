02
Starting deployment of lenathou/manrina-test:staging to localhost.
2025-Sep-18 22:51:34.551179
Preparing container with helper image: ghcr.io/coollabsio/coolify-helper:1.0.11.
2025-Sep-18 22:51:34.964024
[CMD]: docker stop --time=30 jsg40w0so40ssocwk8k084k4
2025-Sep-18 22:51:34.964024
Error response from daemon: No such container: jsg40w0so40ssocwk8k084k4
2025-Sep-18 22:51:35.405381
[CMD]: docker rm -f jsg40w0so40ssocwk8k084k4
2025-Sep-18 22:51:35.405381
Error response from daemon: No such container: jsg40w0so40ssocwk8k084k4
2025-Sep-18 22:51:35.816408
[CMD]: docker run -d --network coolify --name jsg40w0so40ssocwk8k084k4 --rm -v /var/run/docker.sock:/var/run/docker.sock ghcr.io/coollabsio/coolify-helper:1.0.11
2025-Sep-18 22:51:35.816408
65fab556174ce5693bb78139e208d5e7ee0fa73e1929e27b0577f4f4d56d51cd
2025-Sep-18 22:51:38.211174
[CMD]: docker exec jsg40w0so40ssocwk8k084k4 bash -c 'GIT_SSH_COMMAND="ssh -o ConnectTimeout=30 -p 22 -o Port=22 -o LogLevel=ERROR -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null" git ls-remote https://x-access-token:<REDACTED>@github.com/lenathou/manrina-test.git refs/heads/staging'
2025-Sep-18 22:51:38.211174
88d321f3c7f2185d42d53e32d82a3f74b0dc5022	refs/heads/staging
2025-Sep-18 22:51:38.674843
Image not found (m8owwo8k0ok048kgcc4ogwkg:88d321f3c7f2185d42d53e32d82a3f74b0dc5022). Building new image.
2025-Sep-18 22:51:38.975040
----------------------------------------
2025-Sep-18 22:51:38.979413
Importing lenathou/manrina-test:staging (commit sha HEAD) to /artifacts/jsg40w0so40ssocwk8k084k4.
2025-Sep-18 22:51:39.459178
[CMD]: docker exec jsg40w0so40ssocwk8k084k4 bash -c 'git clone --depth=1 --recurse-submodules --shallow-submodules -b 'staging' 'https://x-access-token:<REDACTED>@github.com/lenathou/manrina-test.git' '/artifacts/jsg40w0so40ssocwk8k084k4' && cd /artifacts/jsg40w0so40ssocwk8k084k4 && if [ -f .gitmodules ]; then git submodule sync && GIT_SSH_COMMAND="ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null" git submodule update --init --recursive --depth=1; fi && cd /artifacts/jsg40w0so40ssocwk8k084k4 && GIT_SSH_COMMAND="ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null" git lfs pull'
2025-Sep-18 22:51:39.459178
Cloning into '/artifacts/jsg40w0so40ssocwk8k084k4'...
2025-Sep-18 22:51:42.158278
[CMD]: docker exec jsg40w0so40ssocwk8k084k4 bash -c 'cd /artifacts/jsg40w0so40ssocwk8k084k4 && git log -1 88d321f3c7f2185d42d53e32d82a3f74b0dc5022 --pretty=%B'
2025-Sep-18 22:51:42.158278
fix prices producteur/stocks
2025-Sep-18 22:51:42.681998
Generating nixpacks configuration with: nixpacks plan -f toml --env SOURCE_COMMIT=88d321f3c7f2185d42d53e32d82a3f74b0dc5022 --env COOLIFY_URL=https://staging2.manrina.fr --env COOLIFY_FQDN=staging2.manrina.fr --env COOLIFY_BRANCH=staging --env COOLIFY_RESOURCE_UUID=m8owwo8k0ok048kgcc4ogwkg --env COOLIFY_CONTAINER_NAME=m8owwo8k0ok048kgcc4ogwkg-225130599651 /artifacts/jsg40w0so40ssocwk8k084k4
2025-Sep-18 22:51:43.191056
[CMD]: docker exec jsg40w0so40ssocwk8k084k4 bash -c 'nixpacks plan -f toml --env SOURCE_COMMIT=88d321f3c7f2185d42d53e32d82a3f74b0dc5022 --env COOLIFY_URL=https://staging2.manrina.fr --env COOLIFY_FQDN=staging2.manrina.fr --env COOLIFY_BRANCH=staging --env COOLIFY_RESOURCE_UUID=m8owwo8k0ok048kgcc4ogwkg --env COOLIFY_CONTAINER_NAME=m8owwo8k0ok048kgcc4ogwkg-225130599651 /artifacts/jsg40w0so40ssocwk8k084k4'
2025-Sep-18 22:51:43.191056
Error: Error reading src/context/AppContext.tsx
2025-Sep-18 22:51:43.191056
2025-Sep-18 22:51:43.191056
Caused by:
2025-Sep-18 22:51:43.191056
stream did not contain valid UTF-8
2025-Sep-18 22:51:43.234442
Oops something is not okay, are you okay? 😢
2025-Sep-18 22:51:43.237909
Error: Error reading src/context/AppContext.tsx
2025-Sep-18 22:51:43.237909
2025-Sep-18 22:51:43.237909
Caused by:
2025-Sep-18 22:51:43.237909
stream did not contain valid UTF-8
2025-Sep-18 22:51:43.241448
Deployment failed. Removing the new version of your application.
2025-Sep-18 22:51:43.662693
Gracefully shutting down build container: jsg40w0so40ssocwk8k084k4
2025-Sep-18 22:51:44.280580
[CMD]: docker stop --time=30 jsg40w0so40ssocwk8k084k4
2025-Sep-18 22:51:44.280580
jsg40w0so40ssocwk8k084k4
2025-Sep-18 22:51:44.625434
[CMD]: docker rm -f jsg40w0so40ssocwk8k084k4
2025-Sep-18 22:51:44.625434
Error response from daemon: No such container: jsg40w0so40ssocwk8k084k4