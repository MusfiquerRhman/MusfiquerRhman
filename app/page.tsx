import Image from "next/image";
import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Download,
  Terminal,
  Braces,
  Database,
  Layers3,
  Cpu,
  Mail,
  MessageCircle,
  Code2,
} from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Orb } from "@/components/orb";
import { ContactForm } from "@/components/contact-form";
import { PostCard } from "@/components/post-card";
import { Journey } from "@/components/journey";
import { featuredPosts } from "@/lib/posts";
import { absoluteUrl, jsonLd, profile } from "@/lib/site";
export const dynamic = "force-dynamic";
export const metadata = { alternates: { canonical: "/" } };
const projects = [
  {
    number: "01",
    category: "ENTERPRISE SOFTWARE",
    name: "Buying House ERP",
    client: "Renaissance Group",
    description:
      "An end-to-end enterprise platform with background workers, real-time notifications, and granular permissions.",
    tags: ["Next.js", "tRPC", "PostgreSQL", "BullMQ"],
    art: "erp",
  },
  {
    number: "02",
    category: "EDUCATION TECHNOLOGY",
    name: "TA in a Box",
    client: "Utah Valley University",
    description:
      "A student feedback management system that makes it easier to collect, organize, and act on feedback.",
    tags: ["Full-stack", "Feedback management"],
    art: "education",
  },
  {
    number: "03",
    category: "MEDIA & APPLICATIONS",
    name: "Essential Life",
    client: "Wellness Media LLC",
    description:
      "A unified management platform for media and applications, built during my freelance work.",
    tags: ["Web application", "Media management"],
    art: "media",
  },
];
export default async function Home() {
  let posts: Awaited<ReturnType<typeof featuredPosts>> = [];
  let writingUnavailable = false;
  try {
    posts = await featuredPosts();
  } catch {
    writingUnavailable = true;
  }
  return (
    <>
      <Header />
      <main id="main">
        <section className="hero container" id="top">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="status-dot" /> HELLO, WORLD. I’M MUSFIQUER.
            </div>
            <h1>
              I build things
              <br />
              that{" "}
              <span className="hero-accent">
                make an
                <br className="hero-break" /> impact
                <span className="cursor">_</span>
              </span>
            </h1>
            <p>
              Full-stack developer. Problem solver. Perpetual learner.
              <br className="desktop-break" /> Turning complex problems into
              thoughtful digital experiences.
            </p>
            <div className="hero-actions">
              <a className="button button-primary" href="#work">
                Explore my work <ArrowUpRight size={18} />
              </a>
              <a className="button button-secondary" href={profile.cv} download>
                Download CV <Download size={16} />
              </a>
            </div>
            <div className="hero-location">
              <span className="location-symbol">⌖</span> {profile.location}
              <span className="location-separator">/</span>
              <span>UTC +06:00</span>
            </div>
          </div>
          <div className="hero-visual">
            <div className="visual-coordinate coord-top">
              SYS.01 / ALWAYS CURIOUS
            </div>
            <Orb />
            <div className="terminal-card">
              <div className="terminal-title">
                <div className="window-dots">
                  <i />
                  <i />
                  <i />
                </div>
                <span>musfiquer@localhost: ~</span>
                <Terminal size={13} />
              </div>
              <div className="terminal-body">
                <p>
                  <span className="green">❯</span> whoami
                </p>
                <p className="terminal-output">
                  Full-stack developer &amp; data science explorer
                </p>
                <p>
                  <span className="green">❯</span> cat mindset.json
                </p>
                <pre>
                  {"{\n  "}
                  <span className="code-key">{'"build"'}</span>
                  {": "}
                  <span className="code-value">{'"with purpose"'}</span>
                  {",\n  "}
                  <span className="code-key">{'"learn"'}</span>
                  {": "}
                  <span className="code-value">{'"without limits"'}</span>
                  {",\n  "}
                  <span className="code-key">{'"repeat"'}</span>
                  {": "}
                  <span className="code-bool">true</span>
                  {"\n}"}
                </pre>
                <p>
                  <span className="green">❯</span>{" "}
                  <span className="terminal-cursor">▍</span>
                </p>
              </div>
            </div>
            <div className="visual-coordinate coord-bottom">
              <span className="green">●</span> IDEAS → CODE → IMPACT
            </div>
          </div>
          <a className="scroll-cue" href="#about">
            <ArrowDown size={14} /> SCROLL TO EXPLORE
          </a>
        </section>
        <div className="technology-strip">
          <div className="container">
            <span>
              <Braces size={17} /> TypeScript
            </span>
            <span>
              <Layers3 size={17} /> Next.js
            </span>
            <span>
              <Code2 size={17} /> React
            </span>
            <span>
              <Terminal size={17} /> Node.js
            </span>
            <span>
              <Database size={17} /> PostgreSQL
            </span>
            <span>
              <Cpu size={17} /> tRPC
            </span>
            <span className="strip-note">THE TOOLS. NOT THE LIMIT.</span>
          </div>
        </div>
        <section className="section container about-section" id="about">
          <div className="section-heading">
            <span className="section-index">01 / ABOUT</span>
            <h2>
              A little about the
              <br />
              person behind the code<span className="green">.</span>
            </h2>
          </div>
          <div className="about-grid">
            <div className="about-photo">
              <Image
                src="/profile.jpg"
                alt="Musfiquer Rhman"
                width={360}
                height={420}
              />
              <div className="photo-caption">
                <span className="green">~/musfiquer</span>
                <span>DHAKA, BD</span>
              </div>
            </div>
            <div className="about-copy">
              <p className="about-lead">
                I like understanding how things work.
                <br />
                Then making them work better.
              </p>
              <p>
                I’m Musfiquer, an Executive Programmer at Renaissance Group. I
                build scalable web and mobile applications, connecting clean
                interfaces with the systems that power them.
              </p>
              <p>
                My work spans enterprise software, education, and media
                platforms. These days, I’m also pursuing a master’s in Data
                Science, exploring where software engineering and machine
                learning meet.
              </p>
              <div className="about-stats">
                <div>
                  <strong>
                    100<span className="green">+</span>
                  </strong>
                  <span>LeetCode problems solved</span>
                </div>
                <div>
                  <strong>
                    1400<span className="green">+</span>
                  </strong>
                  <span>Codeforces rating</span>
                </div>
                <div>
                  <strong>
                    3.93<span className="green">/4</span>
                  </strong>
                  <span>Bachelor’s CGPA</span>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="section container work-section" id="work">
          <div className="section-title-row">
            <div>
              <span className="section-index">02 / SELECTED WORK</span>
              <h2>
                Built to solve real problems<span className="green">.</span>
              </h2>
            </div>
            <span className="section-aside">
              A FEW THINGS I’VE HELPED BUILD ↙
            </span>
          </div>
          <div className="project-grid">
            {projects.map((project) => (
              <article className="project-card" key={project.number}>
                <div
                  className={`project-art ${project.art}`}
                  aria-hidden="true"
                >
                  <span className="project-art-label">
                    {project.number} / {project.category}
                  </span>
                  {project.art === "erp" ? (
                    <div className="mini-dashboard">
                      <div className="mini-sidebar">
                        <span className="mini-logo">
                          r<span>.</span>
                        </span>
                        <i />
                        <i />
                        <i />
                        <i />
                      </div>
                      <div className="mini-main">
                        <div className="mini-heading">
                          Operations overview <span>↗</span>
                        </div>
                        <div className="mini-stat-grid">
                          <div>
                            <small>ORDERS</small>
                            <b>1,248</b>
                          </div>
                          <div>
                            <small>IN PROGRESS</small>
                            <b>86</b>
                          </div>
                          <div>
                            <small>EFFICIENCY</small>
                            <b>98.2%</b>
                          </div>
                        </div>
                        <div className="mini-chart">
                          {[
                            25, 42, 35, 64, 53, 76, 68, 92, 81, 99, 88, 112,
                          ].map((height, i) => (
                            <i key={i} style={{ height }} />
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : project.art === "education" ? (
                    <div className="feedback-art">
                      <div className="feedback-bubble">
                        Your feedback.
                        <br />
                        <strong>A better classroom.</strong>
                        <span>✦ ✦ ✦ ✦ ✦</span>
                      </div>
                      <div className="feedback-mini">
                        <span>✓</span> Every voice matters.
                      </div>
                    </div>
                  ) : (
                    <div className="media-art">
                      <span className="media-orbit orbit-one" />
                      <span className="media-orbit orbit-two" />
                      <div className="media-word">
                        essential<span>life.</span>
                      </div>
                      <span className="media-tag">EVERYTHING. CONNECTED.</span>
                    </div>
                  )}
                </div>
                <div className="project-content">
                  <span className="project-client">{project.client}</span>
                  <h3>
                    {project.name}
                    <span className="green">↗</span>
                  </h3>
                  <p>{project.description}</p>
                  <div className="tags">
                    {project.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
          <p className="work-footnote">
            <span className="green">{"//"}</span> Selected work. Project details
            are summarized from my CV.
          </p>
        </section>
        <Journey />
        <section className="section stack-section" id="stack">
          <div className="container">
            <div className="section-title-row">
              <div>
                <span className="section-index">04 / MY TOOLKIT</span>
                <h2>
                  The right tools. The right mindset
                  <span className="green">.</span>
                </h2>
              </div>
              <p className="stack-intro">
                A practical stack for building today.
                <br />A curious mind for what comes next.
              </p>
            </div>
            <div className="stack-grid">
              {[
                {
                  icon: Braces,
                  name: "Frontend",
                  text: "Interfaces that feel right.",
                  skills: [
                    "TypeScript",
                    "React",
                    "Next.js",
                    "React Native",
                    "Tailwind CSS",
                    "Zustand",
                    "TanStack Query",
                  ],
                },
                {
                  icon: Database,
                  name: "Backend & data",
                  text: "Systems that hold up.",
                  skills: [
                    "Node.js",
                    "PostgreSQL",
                    "tRPC",
                    "Prisma",
                    "REST APIs",
                    "Redis",
                    "BullMQ",
                    "MySQL",
                  ],
                },
                {
                  icon: Cpu,
                  name: "AI & exploration",
                  text: "Learning beyond the familiar.",
                  skills: [
                    "Python",
                    "PyTorch",
                    "Pandas",
                    "NumPy",
                    "scikit-learn",
                    "Transformers",
                    "Machine Learning",
                  ],
                },
              ].map((group) => (
                <div className="stack-card" key={group.name}>
                  <group.icon className="green" size={25} />
                  <h3>{group.name}</h3>
                  <p>{group.text}</p>
                  <div className="tags">
                    {group.skills.map((skill) => (
                      <span key={skill}>{skill}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="section container" id="writing">
          <div className="section-title-row">
            <div>
              <span className="section-index">05 / FIELD NOTES</span>
              <h2>
                Ideas, experiments &amp; things learned
                <span className="green">.</span>
              </h2>
            </div>
            <Link className="text-link" href="/blog">
              All writing <ArrowUpRight size={17} />
            </Link>
          </div>
          {posts.length ? (
            <div className="post-grid">
              {posts.map((post, index) => (
                <PostCard key={post.id} post={post} index={index} />
              ))}
            </div>
          ) : (
            <div className="writing-empty">
              <div className="writing-glyph" aria-hidden="true">
                &gt;_
              </div>
              <div>
                <span className="green mono">
                  {writingUnavailable
                    ? "connection.interrupted"
                    : "notes.to_explore"}
                </span>
                <h3>
                  {writingUnavailable
                    ? "My writing will be back shortly."
                    : "Every good idea starts with curiosity."}
                </h3>
                <p>
                  {writingUnavailable
                    ? "Please check back soon for articles and experiments."
                    : "Explore my field notes on what I’m building, discovering, and learning."}
                </p>
              </div>
              <Link
                className="round-link"
                href="/blog"
                aria-label="Visit the blog"
              >
                <ArrowUpRight size={24} />
              </Link>
            </div>
          )}
        </section>
        <section className="section container contact-section" id="contact">
          <div className="contact-copy">
            <span className="section-index">06 / LET’S CONNECT</span>
            <h2>
              Have something
              <br />
              in mind<span className="green">?</span>
              <br />
              <span className="muted">Let’s build it.</span>
            </h2>
            <p>
              A project, a collaboration, or an interesting conversation.
              <br />
              My inbox is open.
            </p>
            <a className="contact-method" href={`mailto:${profile.email}`}>
              <span className="contact-icon">
                <Mail size={20} />
              </span>
              <span>
                <small>DROP ME AN EMAIL</small>
                {profile.email}
              </span>
              <ArrowUpRight size={18} />
            </a>
            <a
              className="contact-method"
              href={profile.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="contact-icon">
                <MessageCircle size={20} />
              </span>
              <span>
                <small>FIND ME ON WHATSAPP</small>
                {profile.whatsapp}
              </span>
              <ArrowUpRight size={18} />
            </a>
            <div className="contact-signoff">
              <span className="green">❯</span> Great things start with a hello.
              <ArrowRight size={15} />
            </div>
          </div>
          <ContactForm />
        </section>
      </main>
      <Footer />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd({
            "@context": "https://schema.org",
            "@type": "Person",
            name: profile.name,
            jobTitle: "Full-stack Developer",
            url: absoluteUrl("/"),
            image: absoluteUrl("/profile.jpg"),
            email: `mailto:${profile.email}`,
            address: {
              "@type": "PostalAddress",
              addressLocality: "Dhaka",
              addressCountry: "BD",
            },
            knowsAbout: [
              "TypeScript",
              "Next.js",
              "PostgreSQL",
              "Machine Learning",
            ],
          }),
        }}
      />
    </>
  );
}
