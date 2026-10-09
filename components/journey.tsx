import { ArrowUpRight, BookOpen, GraduationCap, Terminal } from "lucide-react";
import { ErpArchitecture, ReluGraph } from "@/components/journey-diagrams";
import "./journey.css";

export function Journey() {
  return (
    <section className="section container" id="experience">
      <div className="section-title-row">
        <div>
          <span className="section-index">03 / THE JOURNEY</span>
          <h2>
            Experience that shapes my work<span className="green">.</span>
          </h2>
        </div>
      </div>
      <div className="journey-rows">
        <div className="journey-row">
          <div className="journey-timeline">
            <h3 className="column-label journey-column-label">
              <Terminal size={17} /> EXPERIENCE
            </h3>
            <article className="timeline-item">
              <span className="timeline-date">APR 2025 — PRESENT</span>
              <h3>Executive Programmer</h3>
              <span className="green">Renaissance Group</span>
              <p>
                Architect and full-stack developer of the Buying House ERP.
                Building background processing, email integrations, real-time
                notifications, and permission systems with an Atomic Design
                approach.
              </p>
            </article>
            <article className="timeline-item">
              <span className="timeline-date">MAY 2022 — FEB 2025</span>
              <h3>Freelance Full-stack Developer</h3>
              <span className="green">Upwork</span>
              <p>
                Delivered software for Utah Valley University, Wellness Media
                LLC, and Apps Tango, working across student feedback, media
                management, and other application projects.
              </p>
            </article>
          </div>
          <ErpArchitecture />
        </div>
        <div className="journey-row journey-education-row" id="education">
          <div className="journey-timeline">
            <h3 className="column-label journey-column-label">
              <GraduationCap size={19} /> EDUCATION &amp; RESEARCH
            </h3>
            <article className="timeline-item">
              <span className="timeline-date">IN PROGRESS</span>
              <h3>Master of Data Science</h3>
              <span className="green">
                Bangladesh University of Professionals
              </span>
              <p>
                Exploring AI, machine learning, deep learning, data mining, and
                data analysis.
              </p>
            </article>
            <article className="timeline-item">
              <span className="timeline-date">DEC 2021</span>
              <h3>BSc in Computer Science &amp; Engineering</h3>
              <span className="green">
                Bangladesh University of Business and Technology
              </span>
              <p>Graduated with a CGPA of 3.93.</p>
            </article>
            <a
              className="research-note journey-publication-link"
              href="https://ieeexplore.ieee.org/document/9642536"
              target="_blank"
              rel="noopener noreferrer"
            >
              <BookOpen size={20} />
              <p>
                <span>IEEE RESEARCH PUBLICATION</span>Predicting Alzheimer
                disease at low cost using machine learning
              </p>
              <ArrowUpRight
                size={16}
                className="journey-publication-arrow"
                aria-hidden="true"
              />
            </a>
          </div>
          <ReluGraph />
        </div>
      </div>
    </section>
  );
}
