import React, { useState, useRef, useEffect } from "react";
import LiveFeedCard from "./feed_card";
import { useProducts } from "../providers/productProvider";
import {
  MdcChevronDoubleUp,
  MdcCloseOutline,
  MdcFilterOutline,
  MdcHumanFemale,
  MdcHumanMale,
} from "@meronex/icons/mdc";
import {
  LazyLoadComponent,
  trackWindowScroll,
} from "react-lazy-load-image-component";
import Loader from "./simple_loader";

const LiveFeedSection = ({ sock }) => {
  const { products, fetchProducts, loading } = useProducts();
  const [feedProducts, setFeedProducts] = useState([]);
  const [allActive, setAllActive] = useState(true);
  const [maleActive, setMaleActive] = useState(false);
  const [femaleActive, setFemaleActive] = useState(false);
  const [scrollPos, setScrollPos] = useState(0);
  const [showHelpers, setShowHelpers] = useState(false);
  const [showScroll, setShowScroll] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [expanded, setExpanded] = useState("");
  const [gender, setGender] = useState("");
  const scrollTopRef = useRef();

  const handleFeedScroll = (e) => {
    const feedsScrollView = document.getElementById("scroll-feed");
    const { scrollTop, scrollHeight, offsetHeight } = feedsScrollView;

    if (offsetHeight + scrollTop >= scrollHeight && !loading) {
      fetchProducts(products.length);
    }

    scrollTop > 100 ? setShowScroll(true) : setShowScroll(false);

    if (!showHelpers) {
      setShowHelpers(true);
      setTimeout(() => setShowHelpers(false), 2000);
    }
  };

  const handleScroll = () => {
    const position = window.scrollY;
    setScrollPos(position);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleMale = () => {
    setAllActive(false);
    setFemaleActive(false);
    setMaleActive(true);
    setGender("Male");
  };

  const handleAll = () => {
    setAllActive(true);
    setFemaleActive(false);
    setMaleActive(false);
  };

  const handleFemale = () => {
    setFemaleActive(true);
    setMaleActive(false);
    setAllActive(false);
    setGender("Female");
  };

  return (
    <div className="feed-section" onScroll={handleFeedScroll} id="scroll-feed">
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <span
          onClick={handleAll}
          style={{
            display: "flex",
            backgroundColor: allActive ? "#ED4038" : "gray",
            padding: "5px",
            borderRadius: "30px",
            color: "white",
            alignItems: "center",
            alignContent: "center",
            justifyContent: "center",
            justifyItems: "center",
            marginRight: "5px",
            opacity: 0.8,
            cursor: "pointer",
          }}
        >
          <p> ALL</p>
        </span>
        <span
          onClick={handleMale}
          style={{
            display: "flex",
            backgroundColor: maleActive ? "#ED4038" : "gray",
            padding: "5px",
            borderRadius: "30px",
            color: "white",
            alignItems: "center",
            alignContent: "center",
            justifyContent: "center",
            justifyItems: "center",
            marginRight: "5px",
            opacity: 0.8,
            cursor: "pointer",
          }}
        >
          <MdcHumanMale size={25} />
        </span>
        <span
          onClick={handleFemale}
          style={{
            display: "flex",
            backgroundColor: femaleActive ? "#ED4038" : "gray",
            padding: "5px",
            borderRadius: "30px",
            color: "white",
            alignItems: "center",
            alignContent: "center",
            opacity: 0.8,
            justifyContent: "center",
            justifyItems: "center",
            cursor: "pointer",
          }}
        >
          <MdcHumanFemale size={25} />
        </span>
      </div>
      {loading ? (
        <div className="load">
          <p>Loading Products</p>
          <Loader />
        </div>
      ) : products.length > 0 ? (
        <div className={`inner ${showFilters ? "shift" : ""}`}>
          <div ref={scrollTopRef}></div>
          {allActive &&
            products.map((filteredProduct, id) => (
              <LiveFeedCard
                expanded={expanded === id}
                onExpand={() => setExpanded(id)}
                feed={filteredProduct}
                key={id}
                scroll={scrollPos}
                socket={sock}
              />
            ))}
          {maleActive &&
            products
              .filter((product) => product.gender === "Male")
              .map((filteredProduct, id) => (
                <LiveFeedCard
                  expanded={expanded === id}
                  onExpand={() => setExpanded(id)}
                  feed={filteredProduct}
                  key={id}
                  scroll={scrollPos}
                  socket={sock}
                />
              ))}
          {femaleActive &&
            products
              .filter((product) => product.gender === "Female")
              .map((filteredProduct, id) => (
                <LiveFeedCard
                  expanded={expanded === id}
                  onExpand={() => setExpanded(id)}
                  feed={filteredProduct}
                  key={id}
                  scroll={scrollPos}
                  socket={sock}
                />
              ))}
        </div>
      ) : (
        <div className="load">
          <p>No products yet</p>
        </div>
      )}
      {/* <FilterBox show={showFilters} /> */}

      <div
        onMouseEnter={() => setShowHelpers(true)}
        onMouseLeave={() => setShowHelpers(false)}
        id="helpers"
        className={`${showHelpers || showFilters ? "show" : ""}`}
      >
        {showScroll && (
          <div
            onClick={() =>
              scrollTopRef.current.scrollIntoView({ behavior: "smooth" })
            }
            data-label="Scroll to top"
          >
            <MdcChevronDoubleUp size={25} />
          </div>
        )}
        <div data-label="For Females">
          <MdcHumanFemale size={25} />
        </div>
        <div data-label="For Males">
          <MdcHumanMale size={25} />
        </div>
        {/* <div data-label={showFilters ? "Close" : "Filter"} onClick={()=>setShowFilters(!showFilters)} className="filter">
                    {showFilters ? <MdcCloseOutline size={25} /> : <MdcFilterOutline size={25} />}
                </div> */}
      </div>
      <style jsx>{`
        .feed-section .loader-area {
          min-height: 100px;
          display: flex;
          align-items: center;
          justify-content: center;
          column-gap: 10px;
        }
        .feed-section {
          max-width: 100%;
          height: 100%;
          overflow: auto;
          background: #fafafa;
          --space-x: 2.5%;
        }
        .load {
          display: flex;
          flex-direction: column;
          margin: 20vh auto;
          align-items: center;
          justify-content: center;
        }
        .feed-section > .inner {
          padding: 20px var(--space-x);
          display: column;
          columns: 4;
          column-gap: var(--space-x);
          transition: all 0.25s ease-out;
        }
        .feed-section > .inner.shift {
          transform: translateX(-250px);
        }

        @media (max-width: 1000px) {
          .feed-section > .inner {
            columns: 3;
          }
        }

        @media (max-width: 650px) {
          .feed-section > .inner {
            columns: 2;
            padding: 10px 2%;
            column-gap: 1.5%;
          }
        }

        @media (max-width: 450px) {
          .feed-section > .inner {
            columns: 1;
            padding: 10px 2%;
          }
        }

        #helpers {
          position: fixed;
          bottom: 50px;
          right: -100%;
          border-radius: 50%;
          display: flex;
          flex-direction: column;
          align-items: center;
          transition: all 0.25s ease-in-out;
        }

        #helpers.show,
        #helpers:hover {
          right: 2.5%;
        }

        #helpers > div {
          width: 50px;
          height: 50px;
          background: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          box-shadow: 0 0 10px 2px #00000010;
          overflow: visible;
          color: #222;
          cursor: pointer;
          opacity: 0;
        }

        #helpers.show > div {
          opacity: 1;
          animation: popin 0.25s ease-in-out;
          -webkit-animation: popin 0.25s ease-in-out;
        }

        @keyframes popin {
          0% {
            transform: scale(0.5);
            opacity: 0;
          }
          50% {
            transform: scale(1.2);
          }
        }

        #helpers > div:not(:last-child) {
          margin-bottom: 10px;
        }

        #helpers > div::before {
          content: attr(data-label);
          position: absolute;
          right: 110%;
          top: 50%;
          transform: translateY(-50%);
          padding: 5px 10px;
          border-radius: 10px;
          font-size: 12px;
          background: inherit;
          color: inherit;
          opacity: 0;
          pointer-events: none;
          transition: all 0.15s linear;
          max-width: 200px;
          white-space: nowrap;
        }
        #helpers > div:hover::before {
          opacity: 1;
        }

        @keyframes glow-scale {
          100% {
            transform: scale(2.2);
            opacity: 0;
          }
        }

        #scroll-feed::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

const FilterBox = ({ onFilter, show }) => {
  return (
    <div className={`filter-box ${show ? "show" : ""}`}>
      <h4>Filter By</h4>
      <div className="filter">Recently Added</div>
      <div className="filter">Sold Items</div>
      <div className="filter">On Hold</div>
      <div className="filter">Most Watched</div>
      <div className="filter">Available Items</div>
      <div className="filter">Most Commented</div>
      <style jsx>{`
        .filter-box {
          position: fixed;
          right: -250px;
          top: 60px;
          bottom: 0;
          width: 250px;
          transition: all 0.25s ease-out;
          padding: 20px;
        }

        .filter-box.show {
          right: 0px;
        }

        .filter-box .filter {
          font-size: 12px;
          padding: 10px;
          border-radius: 10px;
          margin-top: 10px;
          background: #fff;
          box-shadow: 0 0 10px 5px#00000005;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default trackWindowScroll(LiveFeedSection);
