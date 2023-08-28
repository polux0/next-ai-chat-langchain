
export function* generateTextChunks(text: string, chunkSize: number = 10): Generator<Uint8Array> {
    const encoder = new TextEncoder();
    for (let i = 0; i < text.length; i += chunkSize) {
      yield encoder.encode(text.slice(i, i + chunkSize));
    }
  }
  
export function createIterableReadableStreamFromText(): ReadableStream<Uint8Array> {
    const chunks = generateTextChunks(text);
  
    return new ReadableStream({
      async start(controller) {
        for (const chunk of chunks) {
          controller.enqueue(chunk);
        }
        controller.close();
      }
    });
  }

  const text = `Collaborative Finance (CoFi) is an approach to money and finance based on the actual structure of the payments graph. Money is where the payments are. Rather than thinking only about the quantity of money, we care most of all about its quality. What makes quality money? Money that flows in closed-loops across firms in society. How do we find these loops? We have to map the payments graph.

  The CoFi project seeks to:
  
  deepen our understanding of the structure and health of networks of obligations
  build tools to enable a healthier relationship between commercial economies and the liquidity that sustains them
  CoFi emerged as a generalization of a paper by members of our team: Liquidity-Saving through Obligation-Clearing and Mutual Credit. The paper had such an impact a review was written called Someone Just Turned The Lights On. That paper describes two specific services made possible by mapping the payments graph, and the incredible benefits to the health of an economy that can be obtained by combining them. Those services are obligation-clearing and mutual credit.
  
  Obligation clearing (technically, Multilateral Trade-Credit Set-off, or MTCS), allows invoices in closed loops to be cleared against one another. If you collect a bunch of invoices from firms, you can find all the closed loops (they exist!), and send every firm a notice of how much their invoices can be decreased (both how much they have to pay, and how much they get paid). The amount your invoices decreases by depends on how many closed loops you are a part of. So it saves businesses liquidity - it shrinks their balance sheet - by encouraging quality cyclic-loops of obligation. It’s a liquidity-saving mechanism. Liquidity stress (“late payments”) is the number one reason small firms go out of business. Turns out Slovenia’s been running an MTCS system at national scale for 30 years to the significant benefit of its economy.
  
  But MTCS cannot clear all the trade-credit, only some fraction - from our research, with real payments data from European systems, we’ve seen MTCS clearing 10-20% of the trade-credit. Clearing the rest requires other liquidity sources - firms need cash on hand, from their bank account, from factoring an invoice, from a bank loan, or from mutual credit. Mutual Credit allows firms to take out loans in an local currency pegged to a common Unit of Account, where loans are collateralized by the firm’s future production. A firm taking out a $10k loan in the internal currency must accept that currency back for some multiple (eg. $50k) of its future sales. There are a few highly successful mutual credit systems - the WIR Bank in Switzerland, Sardex in Sardinia, Grassroots Economics in Kenya.
  
  The CoFi paper showed that by combining obligation-clearing with mutual-credit, up to 50% (!) of the net internal debt could be cleared. A massive liquidity savings. Out of this insight, we have founded the CoFi project, which seeks to expand our understanding of the structure of the payments graph and what makes it healthy, and to build the tools that enable a healthier relationship between commercial economies and the liquidity that sustains them. See the FAQ for more info.
  
  At Informal Systems, we are using Cosmos tools to build payments infrastructure with positive externalities for communities, to realize the vision of Collaborative Finance.`;  