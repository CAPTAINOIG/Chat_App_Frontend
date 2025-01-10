import { Button, Popover, PopoverContent, PopoverTrigger, Select, SelectItem, Switch } from '@nextui-org/react';
import { TbAbc, TbChartBar, TbChartLine, TbChartPie } from 'react-icons/tb';
import PropTypes from 'prop-types';
import { getChartsDefaultStyle, getElementDefaultStyle } from '@/lib/elements.js';
import { LiaElementor } from 'react-icons/lia';
import useTemplateStore from '@/store/template.js';

const elements = [
  {
    id: 'chart-s-bar',
    category: 'bar',
    data: {
      type: 'chart-s',
      useBackgroundImage: false,
      backgroundImage: null,
      backgroundColor: '#000',
      useBackgroundColor: false,
      text: 'Bar Chart',
      width: 400,
      height: 300,
      style: getElementDefaultStyle({ type: 'chart-s', name: 'bar' }),
      config: {
        name: 'bar',
        styles: getChartsDefaultStyle({ type: 'chart-s', name: 'bar' }),
        data: [
          { name: 'Page A', value: 4000 },
          { name: 'Page B', value: 3000 },
          { name: 'Page C', value: 2000 },
          { name: 'Page D', value: 2780 },
          { name: 'Page E', value: 1890 },
          { name: 'Page E', value: 4000 },
          { name: 'Page F', value: 3000 },
          { name: 'Page G', value: 2000 },
          { name: 'Page H', value: 2780 },
          { name: 'Page I', value: 1890 },
        ],
        keys: { x: 'name', y: 'value' },
        showXaxis: false,
        showYaxis: false,
        showLegend: false,
        colors: [
          '#E66B5B',
          '#1D9085',
          '#264A5A',
          '#E8C22C',
          '#F6881F',
          '#E66B5B',
          '#1D9085',
          '#264A5A',
          '#E8C22C',
          '#F6881F',
        ],
        useGradient: false,
        gradientColor: '#2673D9',
        showXGridline: false,
        showYGridline: false,
        bars: 5,
        fontSize: 12,
      },
      tooltip: {
        enabled: false,
      },
    },
    preview: (
      <div className="text-black/40 dark:text-white/70 hover:text-black/50 dark:hover:text-white/60">
        <TbChartBar className="w-full h-full" />
      </div>
    ),
  },
  {
    id: 'chart-s-pie',
    category: 'pie',
    data: {
      type: 'chart-s',
      text: 'Pie Chart',
      width: 500,
      height: 400,
      style: getElementDefaultStyle({ type: 'chart-s', name: 'pie' }),
      config: {
        name: 'pie',
        styles: getChartsDefaultStyle({ type: 'chart-s', name: 'bar' }),
        data: [
          { name: 'Page A', value: 4000 },
          { name: 'Page B', value: 3000 },
          { name: 'Page C', value: 2000 },
          { name: 'Page D', value: 2780 },
          { name: 'Page E', value: 1890 },
        ],
        keys: { name: 'name', y: 'value' },
        colors: ['#E66B5B', '#1D9085', '#264A5A', '#E8C22C', '#F6881F'],
        useGradient: false,
        gradientColor: '#2673D9',
        showLabel: true,
        pies: 5,
        showLegend: false,
        showToolTip: true,
        legendPosition: 'top',
        fontSize: 12,
      },
    },
    preview: (
      <div className="text-black/40 dark:text-white/70 hover:text-black/50 dark:hover:text-white/60">
        <TbChartPie className="w-full h-full" />
      </div>
    ),
  },
  {
    id: 'chart-s-line',
    category: 'line',
    data: {
      type: 'chart-s',
      useBackgroundImage: false,
      backgroundImage: null,
      backgroundColor: '#000',
      useBackgroundColor: false,
      text: 'Line Chart',
      width: 400,
      height: 300,
      style: getElementDefaultStyle({ type: 'chart-a', name: 'line' }),
      config: {
        name: 'line',
        styles: getChartsDefaultStyle({ type: 'chart-a', name: 'line' }),
        data: [
          { name: 'Page A', value: 4000 },
          { name: 'Page B', value: 3000 },
          { name: 'Page C', value: 2000 },
          { name: 'Page D', value: 2780 },
          { name: 'Page E', value: 1890 },
        ],
        keys: { x: 'name', y: 'value' },
        colors: ['#E66B5B'],
        showXGridline: false,
        showYGridline: false,
        fontSize: 12,
        bars: 5,
        showLegend: false,
        showXaxis: false,
        showYaxis: false,
        type: 'Natural',
        tools: {
          colors: {
            gradient: false,
            palettes: false,
          },
        },
      },
    },
    preview: (
      <div className="text-black/40 dark:text-white/70 hover:text-black/50 dark:hover:text-white/60">
        <TbChartLine className="w-full h-full" />
      </div>
    ),
  },
];

const ElementTag = ({ element, onChange }) => {
  const updateTemplate = useTemplateStore((state) => state.updateTemplate);
  const openTool = useTemplateStore((state) => state.template.openTool);

  return (
    <Popover
      placement="left"
      showArrow
      offset={10}
      classNames={{ content: 'w-[350px] !max-h-[550px] overflow-y-auto block' }}
      isOpen={openTool === 'element-tag'}
      onOpenChange={(isOpen) => {
        updateTemplate({ openTool: isOpen ? 'element-tag' : null });
      }}
    >
      <PopoverTrigger>
        <Button isIconOnly variant="light" aria-label="Adjust font size">
          <LiaElementor size="18" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-4 shadow border border-gray-200 max-h-[550px] overflow-y-auto">
        <div className="space-y-3">
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <p className="text-base">Enable tooltip</p>
              <Switch
                isSelected={!!element.tooltip?.enabled}
                onValueChange={(v) => {
                  onChange({ ...element, tooltip: { ...element.tooltip, enabled: v } });
                }}
              />
            </div>
            {element.tooltip?.enabled && (
              <div className="space-y-4 mt-6">
                <Select placeholder="Select one" aria-label="Field">
                  {[{ key: 'default', name: 'Default' }].map((type) => (
                    <SelectItem key={type.key}>{type.name}</SelectItem>
                  ))}
                </Select>
                <Select placeholder="Select one" aria-label="Data">
                  {[
                    { key: 'disbursement-by-date', label: 'Disbursement by date' },
                    { key: 'disbursement-by-range', label: 'Disbursement by range' },
                  ].map((item) => (
                    <SelectItem key={item.key}>{item.label}</SelectItem>
                  ))}
                </Select>
                <div className="flex gap-4 pt-2">
                  <div
                    className="text-center cursor-pointer"
                    onClick={() => onChange({ ...element, tooltip: { ...element.tooltip, type: 'text' } })}
                  >
                    <TbAbc className="w-full h-full text-gray-500" />
                    <p>Text</p>
                  </div>
                  {elements.map((e) => (
                    <div
                      className="cursor-pointer"
                      key={e.id}
                      onClick={() =>
                        onChange({ ...element, tooltip: { ...element.tooltip, type: e.data.config.name } })
                      }
                    >
                      {e.preview}
                      <p className="text-center">{e.data.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <p className="text-base">Enable modal</p>
              <Switch
                isSelected={!!element.modal?.enabled}
                onValueChange={(v) => {
                  onChange({ ...element, modal: { ...element.modal, enabled: v } });
                }}
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

ElementTag.propTypes = {
  element: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default ElementTag;
