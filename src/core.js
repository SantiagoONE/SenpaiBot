'use strict'

const low = require('lowdb')
// persisted using async file storage
const db = low('db.json', {
    storage: require('lowdb/lib/storages/file-async')
})

let getMemberByPosition = (index) => {
    let result = db.get('members[' + index + ']').value()
    return result
}

module.exports = {
    updateNextMaster: () => {
        let indexLastMaster =  db.get('master').value()
        let totalMembers = db.get('members').size().value()
        let indexNextMaster = (indexLastMaster + 1) % totalMembers
        //return a promise
        return db.set('master', indexNextMaster).write()
    },
    tellMeWhoIsMaster: () => {
        let indexMaster = db.get('master').value()
        return getMemberByPosition(indexMaster)
    },
    listMembersByPriority: () => {
        let indexLastMaster =  db.get('master').value()
        let members = db.get('members').cloneDeep().value()
        if (indexLastMaster > 0) {
            members = members.concat(members.splice(0, indexLastMaster))
        }
        return members
    },
    getMemberById: (id) => {
        return db.get('members').find({ id: id }).value()
    }
}