---
title: A T1 to the House
date: 2026-05-12
tags: [tech]
audience: user
summary: Running a web business in the late 90s meant a SPARC box, a T1 line, and a prayer that traffic stayed flat.
---

In the late 90s I ran an ad serving site — cigar.com. Buy clicks cheap, sell impressions at a higher rate, make money on the difference. It worked. The infrastructure was a Sun SPARC box in my office and an ISDN line. Then I upgraded to a T1.

A T1 to the house was $1,000-1,500 a month just for the line. The SPARC box was a capital expense. When traffic spiked, the box fell over or the line saturated — not a bigger bill, a down site. Every decision about capacity was made in advance and paid for whether you needed it or not.

The economics of running anything on the web were: buy hardware, pay for bandwidth, hope your traffic estimates were right, and accept that scaling up meant a phone call to a vendor and a wait.

## The same site today

Static files on S3. CloudFront in front of it. Lambda for the dynamic parts. DynamoDB for click tracking.

The T1 is replaced by CloudFront's global edge network — faster, more reliable, and the cost is fractions of a cent per request. The SPARC box is replaced by Lambda functions that don't exist until they're called. The capacity planning is replaced by auto-scaling that happens automatically and a bill that arrives after the fact.

A traffic spike isn't a crisis. It's a slightly higher AWS bill at the end of the month.

## What changed

The hardware costs went to zero. The bandwidth costs went to near-zero. The operational burden — patching, monitoring, replacing failed disks — went to someone else.

What didn't change: you still need to build the thing. The ideas, the architecture, the decisions about what to serve and to whom — that's still the work. The infrastructure just got out of the way.

The T1 was $1,500 a month. This site is $1. The work is the same. The overhead is not.
