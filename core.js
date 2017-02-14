'use strict';

const low = require('lowdb');
// persisted using async file storage
const db = low('db.json', {
    storage: require('lowdb/lib/storages/file-async')
});

var getMemberByPosition = (index) => {
    return db.get('members[' + index + ']').value();
};

module.exports = {
    updateNextGod: () => {
        var indexLastGod =  db.get('god').value();
        var totalMembers = db.get('members').size().value();
        var indexNextGod = (indexLastGod + 1) % totalMembers;
        //return a promise
        return db.set('god', indexNextGod).write();
    },
    tellMeWhoIsGod: () => {
        var indexGod = db.get('god').value();
        return getMemberByPosition(indexGod);
    },
    listMembersByPriority: () => {
        var indexLastGod =  db.get('god').value();
        var members = db.get('members').value();
        if (indexLastGod > 0) {
            members = members.concat(members.splice(0, indexLastGod));
        }
        return members;
    },
    getMemberById: (id) => {
        return db.get('members').find({ id: id }).value();
    }
};