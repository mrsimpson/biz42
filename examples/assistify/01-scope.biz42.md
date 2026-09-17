# Scope

Assistify was a DACH-focused, GDPR-compliant group chat platform for knowledge worker teams in IT and large enterprises. Its core purpose was to accelerate inter-human communication by using AI to implicitly surface relevant knowledge from ongoing group conversations — without requiring users to explicitly search or tag content. Adjacent systems such as wikis, SharePoint sites, and public websites fed into the knowledge discovery layer. Slack was the primary competitor; its status as a US-hosted SaaS made it non-compliant with many corporate and GDPR policies, which was a key differentiator for Assistify. 1:1 messaging was technically possible but not the core use case. Document management, task tracking, and voice/video communication were out of scope.

```biz42
:::scope
id: scope-assistify
title: Assistify
included: group chat for knowledge worker teams, AI-powered implicit knowledge discovery, DACH market, IT teams and enterprise sub-teams, GDPR-compliant deployment, integration with wikis / SharePoint / websites
excluded: 1:1 private messaging (incidental only), document management and file versioning, project and task management, voice and video communication, markets outside DACH
:::
```

The SIPOC below maps Assistify's core value delivery process from the external inputs that feed into the platform to the knowledge workers and enterprise teams who receive the outputs.

```biz42
:::diagram
id: diagram-sipoc
title: Assistify SIPOC
notation: sipoc
:::
```

```mermaid
flowchart TD
    subgraph sipoc-supplier["Supplier"]
        direction LR
        s1["Knowledge worker teams"] ~~~ s2["Enterprise IT / compliance"] ~~~ s3["Wikis, SharePoint, websites"]
    end
    subgraph sipoc-input["Input"]
        direction LR
        sig-information-overload["Information overload"] ~~~ sig-gdpr-pressure["GDPR requirements"] ~~~ exp-implicit-discovery["Need: implicit discovery"]
    end
    subgraph sipoc-process["Process"]
        direction LR
        obj-enterprise-sales["Win DACH enterprise accounts"] ~~~ obj-vp-clarity["Deliver implicit AI value"] ~~~ obj-ai-moat["Deepen AI capability"]
    end
    subgraph sipoc-output["Output"]
        direction LR
        prod-group-chat-platform["Group chat + AI discovery"] ~~~ prod-livechat["Live chat"] ~~~ prod-translation["Auto translation"] ~~~ prod-chatops["ChatOps"]
    end
    subgraph sipoc-customer["Customer"]
        direction LR
        c1["Knowledge worker teams (DACH)"] ~~~ c2["DB Group business units"] ~~~ c3["Cross-border rail operators"]
    end

    sipoc-supplier --> sipoc-input
    sipoc-input --> sipoc-process
    sipoc-process --> sipoc-output
    sipoc-output --> sipoc-customer
```
