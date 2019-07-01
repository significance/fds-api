npm run build
echo "built"

HOST=root@geth-noordung.fairdatasociety.org

ssh $HOST -N -L 2000:127.0.0.1:8500 & echo $! > /tmp/fds-deploy-sshpid
echo "waiting for ssh tunnel"
while ! nc -z localhost 2000; do   
  sleep 0.1 # wait for 1/10 of the second before check again
done

echo "created tunnel, uploading to $HOST"
uploaded_hash=$(swarm --bzzapi http://localhost:2000/ --defaultpath index.html --recursive up ../build)

echo "uploaded hash"