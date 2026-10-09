type NodeProps = {
  x: number;
  y: number;
  width: number;
  height: number;
  title: string;
  detail: string;
  extra?: string;
  accent?: boolean;
};

function ArchitectureNode({
  x,
  y,
  width,
  height,
  title,
  detail,
  extra,
  accent = false,
}: NodeProps) {
  const center = x + width / 2;
  const titleY = y + (extra ? 27 : height / 2 - 5);
  return (
    <g className={accent ? "journey-accent-node" : "journey-node"}>
      <rect x={x} y={y} width={width} height={height} rx="7" />
      <text x={center} y={titleY} className="journey-node-title">
        {title}
      </text>
      <text x={center} y={titleY + 23} className="journey-node-detail">
        {detail}
      </text>
      {extra && (
        <text x={center} y={titleY + 46} className="journey-node-detail">
          {extra}
        </text>
      )}
    </g>
  );
}

export function ErpArchitecture() {
  return (
    <div className="journey-visual journey-erp-visual" aria-hidden="true">
      <svg
        className="journey-diagram"
        viewBox="0 0 560 554"
        role="img"
        aria-labelledby="erp-diagram-title erp-diagram-description"
      >
        <title id="erp-diagram-title">Buying House ERP architecture</title>
        <desc id="erp-diagram-description">
          The Next.js frontend uses TanStack Query for client-side caching of
          server state and calls the tRPC ERP API. The API checks Redis for
          cached data and uses Prisma and PostgreSQL on a cache miss or a write.
          File endpoints use file storage. The API and cron scheduler enqueue
          Redis-backed BullMQ jobs, which a separate Node.js worker processes.
          The worker accesses application data through Prisma.
        </desc>
        <defs>
          <marker
            id="erp-arrow"
            markerWidth="7"
            markerHeight="7"
            refX="6"
            refY="3.5"
            orient="auto-start-reverse"
          >
            <path d="M0 0 L7 3.5 L0 7 Z" fill="#93bd6b" />
          </marker>
        </defs>
        <rect
          x="12"
          y="12"
          width="536"
          height="106"
          rx="9"
          className="journey-browser-group"
        />
        <text x="28" y="34" className="journey-group-label">
          BROWSER
        </text>
        <g className="journey-request-edges">
          <path
            d="M246 76 H291"
            markerStart="url(#erp-arrow)"
            markerEnd="url(#erp-arrow)"
          />
          <path d="M133 102 V138 H97 V167" markerEnd="url(#erp-arrow)" />
          <path d="M417 102 V138 H280 V167" markerEnd="url(#erp-arrow)" />
          <path
            d="M363 204 H391"
            markerStart="url(#erp-arrow)"
            markerEnd="url(#erp-arrow)"
          />
          <path d="M97 236 V339" markerEnd="url(#erp-arrow)" />
          <path d="M170 205 H187 V378 H197" markerEnd="url(#erp-arrow)" />
          <path d="M280 236 V270" />
          <path d="M280 300 V339" markerEnd="url(#erp-arrow)" />
          <path d="M280 410 V461" markerEnd="url(#erp-arrow)" />
          <path d="M398 378 H363" markerEnd="url(#erp-arrow)" />
        </g>
        <g className="journey-job-edges">
          <path d="M352 236 V288 H432 V267" markerEnd="url(#erp-arrow)" />
          <path d="M468 260 V339" markerEnd="url(#erp-arrow)" />
          <path d="M536 499 H549 V230 H543" markerEnd="url(#erp-arrow)" />
        </g>
        <text x="280" y="289" className="journey-edge-label">
          Miss / write
        </text>
        <text x="392" y="281" className="journey-edge-label">
          Enqueue
        </text>
        <text x="490" y="314" className="journey-edge-label">
          Jobs
        </text>
        <ArchitectureNode
          x={24}
          y={50}
          width={222}
          height={52}
          title="Next.js frontend"
          detail="Web interface"
        />
        <ArchitectureNode
          x={298}
          y={50}
          width={238}
          height={52}
          title="TanStack Query"
          detail="Client cache of server state"
        />
        <ArchitectureNode
          x={24}
          y={174}
          width={146}
          height={62}
          title="Next.js"
          detail="Files / photos"
        />
        <ArchitectureNode
          x={204}
          y={174}
          width={152}
          height={62}
          title="Next.js · tRPC"
          detail="ERP API"
          accent
        />
        <ArchitectureNode
          x={398}
          y={164}
          width={138}
          height={96}
          title="Redis"
          detail="Cache · locks"
          extra="BullMQ queues"
          accent
        />
        <ArchitectureNode
          x={24}
          y={346}
          width={146}
          height={64}
          title="File storage"
          detail="Uploads / media"
        />
        <ArchitectureNode
          x={204}
          y={346}
          width={152}
          height={64}
          title="Prisma"
          detail="ORM · data access"
        />
        <ArchitectureNode
          x={398}
          y={346}
          width={138}
          height={64}
          title="Node.js worker"
          detail="BullMQ processor"
          accent
        />
        <ArchitectureNode
          x={204}
          y={468}
          width={152}
          height={62}
          title="PostgreSQL"
          detail="Application data"
        />
        <ArchitectureNode
          x={398}
          y={468}
          width={138}
          height={62}
          title="Scheduled tasks"
          detail="Cron → queue"
        />
      </svg>
    </div>
  );
}

export function ReluGraph() {
  return (
    <div className="journey-visual journey-relu-visual" aria-hidden="true">
      <svg
        className="journey-diagram"
        viewBox="0 0 560 360"
        role="img"
        aria-labelledby="relu-graph-title relu-graph-description"
      >
        <title id="relu-graph-title">ReLU activation function</title>
        <desc id="relu-graph-description">
          ReLU returns zero for negative inputs and the input itself for
          positive inputs. The graph is flat along the negative x axis, then
          rises with a slope of one from the origin: ReLU(x) equals max(0, x).
        </desc>
        <defs>
          <marker
            id="relu-axis-arrow"
            markerWidth="6"
            markerHeight="6"
            refX="5"
            refY="3"
            orient="auto"
          >
            <path d="M0 0 L6 3 L0 6 Z" fill="#789560" />
          </marker>
        </defs>
        <g className="journey-relu-axes">
          <path d="M48 280 H516" markerEnd="url(#relu-axis-arrow)" />
          <path d="M230 310 V36" markerEnd="url(#relu-axis-arrow)" />
        </g>
        <path d="M70 280 H230 L455 55" className="journey-relu-curve" />
        <g className="journey-relu-label">
          <text x="515" y="302">
            x
          </text>
          <text x="245" y="42">
            y
          </text>
          <text x="214" y="301">
            0
          </text>
        </g>
        <text x="360" y="337" className="journey-relu-formula">
          ReLU(x) = max(0, x)
        </text>
      </svg>
    </div>
  );
}
