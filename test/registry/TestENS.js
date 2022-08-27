const namehash = require('eth-fns-namehash');
const sha3 = require('web3-utils').sha3;

const { exceptions } = require("../test-utils")

let contracts = [
    [artifacts.require('./registry/FNSRegistry.sol'), 'Solidity']
];

contracts.forEach(function ([FNS, lang]) {
    contract('FNS ' + lang, function (accounts) {

        let fns;

        beforeEach(async () => {
            fns = await FNS.new();
        });

        it('should allow ownership transfers', async () => {
            let addr = '0x0000000000000000000000000000000000001234';

            let result = await fns.setOwner('0x0', addr, {from: accounts[0]});

            assert.equal(await fns.owner('0x0'), addr)

            assert.equal(result.logs.length, 1);
            let args = result.logs[0].args;
            assert.equal(args.node, "0x0000000000000000000000000000000000000000000000000000000000000000");
            assert.equal(args.owner, addr);
        });

        it('should prohibit transfers by non-owners', async () => {
            await exceptions.expectFailure(
                fns.setOwner('0x1', '0x0000000000000000000000000000000000001234', {from: accounts[0]})
            );
        });

        it('should allow setting resolvers', async () => {
            let addr = '0x0000000000000000000000000000000000001234'

            let result = await fns.setResolver('0x0', addr, {from: accounts[0]});

            assert.equal(await fns.resolver('0x0'), addr);

            assert.equal(result.logs.length, 1);
            let args = result.logs[0].args;
            assert.equal(args.node, "0x0000000000000000000000000000000000000000000000000000000000000000");
            assert.equal(args.resolver, addr);
        });

        it('should prevent setting resolvers by non-owners', async () => {
            await exceptions.expectFailure(
                fns.setResolver('0x1', '0x0000000000000000000000000000000000001234', {from: accounts[0]})
            );
        });

        it('should allow setting the TTL', async () => {
            let result = await fns.setTTL('0x0', 3600, {from: accounts[0]});

            assert.equal((await fns.ttl('0x0')).toNumber(), 3600);

            assert.equal(result.logs.length, 1);
            let args = result.logs[0].args;
            assert.equal(args.node, "0x0000000000000000000000000000000000000000000000000000000000000000");
            assert.equal(args.ttl.toNumber(), 3600);
        });

        it('should prevent setting the TTL by non-owners', async () => {
            await exceptions.expectFailure(fns.setTTL('0x1', 3600, {from: accounts[0]}));
        });

        it('should allow the creation of subnodes', async () => {
            let result = await fns.setSubnodeOwner('0x0', sha3('eth'), accounts[1], {from: accounts[0]});

            assert.equal(await fns.owner(namehash.hash('eth')), accounts[1]);

            assert.equal(result.logs.length, 1);
            let args = result.logs[0].args;
            assert.equal(args.node, "0x0000000000000000000000000000000000000000000000000000000000000000");
            assert.equal(args.label, sha3('eth'));
            assert.equal(args.owner, accounts[1]);
        });

        it('should prohibit subnode creation by non-owners', async () => {
            await exceptions.expectFailure(fns.setSubnodeOwner('0x0', sha3('eth'), accounts[1], {from: accounts[1]}));
        });
    });
});