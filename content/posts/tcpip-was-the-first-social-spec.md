---
title: TCP/IP Was the First Social Spec
date: 2026-05-12
tags: [tech]
audience: user
summary: Before TCP/IP, you asked to join a network. After it, speaking the protocol was enough.
---

Before TCP/IP, networks were proprietary. IBM had SNA. DEC had DECnet. CompuServe had CompuServe. You joined someone's network on their terms, with their hardware, under their rules. And ARPANET — the government research network that predated the internet — required institutional approval. You petitioned to connect. Someone decided if you were in.

TCP/IP ended that.

The spec is public. Implementation is sufficient. No one grants you membership. If you speak the protocol, you're on the network. The social contract went from "we decide who's in" to "if you can do the handshake, you belong."

That's not an engineering decision. That's a political one dressed up as an engineering one.

## Permission replaced by protocol

The shift matters because of what it removed: the membership committee. Every proprietary network before TCP/IP had one, explicitly or implicitly. Connecting required a relationship, a contract, an approval. The network operator was the gatekeeper.

TCP/IP has no operator. There's no one to ask. The RFC is public, the implementations are public, and the network will route your packets without knowing or caring who you are.

DNS extended this to names. HTTP extended it to documents. SMTP extended it to messages. Each layer inherited the same social assumption: speak the protocol, participate. No permission required.

## It's more like a language than a club

A club has a membership list. A language has speakers.

Nobody owns English. Nobody approves your use of it. If you can make yourself understood, you're using the language — that's all it takes. TCP/IP works the same way. The protocol is the credential. There's no issuing authority.

This is why the internet scaled the way it did. A proprietary network scales to the size of its operator's ambition and capital. A language scales to the number of people who learn it.

## What came after forgot this

The applications built on top of TCP/IP mostly rebuilt the permission model. Social networks have accounts you apply for, terms of service you agree to, moderation policies that can remove you. App stores have developer agreements. Cloud platforms have acceptable use policies.

The infrastructure is permissionless. The applications are not.

Whether that's a regression or just a practical necessity is a longer argument. But the original bet — that participation could be defined entirely by a public spec, with no gatekeeper — turned out to be correct enough to build the entire internet on.
