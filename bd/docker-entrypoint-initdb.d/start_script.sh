#!/bin/bash



until mongosh --host mongo1 --eval 'db.adminCommand({ping:1})' &>/dev/null; do
  echo "mongo1 недоступен. Ожидание..."
  sleep 1
done


until mongosh --host mongo2 --eval 'db.adminCommand({ping:1})' &>/dev/null; do
  echo "mongo2 недоступен. Ожидание..."
  sleep 1
done

until mongosh --host mongo3 --eval 'db.adminCommand({ping:1})' &>/dev/null; do
  echo "mongo3 недоступен. Ожидание..."
  sleep 
done


mongosh --host mongo1 << EOF
          config = {
          "_id" : "my-mongo-set",
          "members" : [
            {
              "_id" : 0,
              priority : 3,
              "host" : "mongo1:27017"
            },
            {
              "_id" : 1,
              priority : 2,
              "host" : "mongo2:27017"
            },
            {
              "_id" : 2,
              "host" : "mongo3:27017",
              arbiterOnly : true
            }
          ]
          };
          rs.initiate(config);
EOF

exit 0 
          