import { ConstellationField } from "@designcodeio/threeui";
import "@designcodeio/threeui/style.css";

export function Scene() {
  return (
    <div className="shader-frame" aria-hidden="true">
      <ConstellationField
        mode="dark"
        speed={1.00}
        size={1.00}
        strokeWidth={1.00}
        length={1.00}
        density={1.00}
        opacity={1.00}
        hue={0}
        saturation={1.00}
        brightness={1.00}
      />
    </div>
  );
}

export default Scene;
