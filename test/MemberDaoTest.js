let assert = require('assert');
let fs = require('fs');

describe("MemberDaoTest", function() {
    let memberDao = require("../MemberDao");
    memberDao.dbFilePath = "dbTest.sqlite3";

    beforeEach(function() {
        memberDao.createDatabase();

        return memberDao.createTable()
            .then(function() {
                let sql = fs.readFileSync("./test/SetupTestDb.sql", {encoding: "utf8"});

                return new Promise(function(resolve, reject) {
                    memberDao.db.exec(sql, function(err) {
                        if (err) {
                            reject()
                        } else {
                            resolve()
                        }
                    })
                });

            });
    });

    afterEach(function() {
        return new Promise(function(resolve, reject) {
            memberDao.db.close(function(error) {
                if (error) {
                    reject(error)
                } else {
                    fs.unlinkSync('./dbTest.sqlite3');
                    resolve()
                }
            });
        });

    });

    describe("#insert", function() {
        it("should insert a member", function() {
            return memberDao.insert("testMember")
                .then(function(row) {
                    return row
                })
        })
    });

    describe("#select", function() {
        it("should select a member", function() {
            return memberDao.select(1)
                .then(function(row) {
                    assert.notStrictEqual(row, null, "The selection must not be empty.")
                })
        });

        it("member should have an id property", function() {
            return memberDao.select(1)
                .then(function(row) {
                    assert.strictEqual(row.id, 1, "The member id should be 1.")
                })
        })
    });

    describe("#selectAll", function() {
        it("should select all members", function() {
            return memberDao.selectAll()
                .then(function(rows) {
                    return assert.strictEqual(rows.length, 3, "The selection does not have all (3) members.")
                })
        })
    });

    describe("#update", function() {
        it("should update a member", function() {
            return memberDao.update(1, "Clark Kent", "clark@uh.edu")
                .then(function() {
                    return new Promise(function(resolve, reject) {
                        memberDao.db.get("SELECT * FROM members WHERE id = 1", [], function(err, row) {
                            if (err) {
                                reject(err)
                            }

                            assert.strictEqual(row.name, "Clark Kent", "The member's name was not updated.");

                            resolve()
                        })
                    });
                })
        })
    });

    describe("#remove", function() {
        it("should remove a member", function() {
            return memberDao.remove(1)
                .then(function () {
                    return new Promise(function(resolve, reject) {
                        memberDao.db.all("SELECT * FROM members", [], function(err, rows) {
                            if (err) {
                                reject(err)
                            }

                            assert.strictEqual(rows.length, 2, "There should only be 2 members now.");

                            resolve()
                        })
                    });
                });
        })
    })
});