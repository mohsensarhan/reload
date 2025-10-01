import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, Users, DollarSign } from "lucide-react";
import efbLogo from '@/assets/efb-logo.png';

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-3 sm:p-6 lg:p-8 xl:p-12">
      <div className="w-full max-w-7xl text-center space-y-6 sm:space-y-8 lg:space-y-12 xl:space-y-16">
        {/* Logo and Header */}
        <div className="flex flex-col items-center gap-4 sm:gap-6 lg:gap-8">
          <img src={efbLogo} alt="EFB Logo" className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 xl:w-32 xl:h-32" />
          <div className="space-y-3 sm:space-y-4 lg:space-y-6">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-bold leading-tight">
              Humanitarian Impact 
              <span className="text-primary ml-2 block sm:inline">Intelligence Center</span>
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-muted-foreground max-w-full sm:max-w-2xl lg:max-w-4xl xl:max-w-6xl mx-auto leading-relaxed px-4">
              Advanced analytics and real-time monitoring of Egypt's largest food security operation. 
              Comprehensive mission data for <strong className="text-primary">367.5 million meals</strong> delivered across 
              <strong className="text-primary"> 27 governorates</strong> in FY2024/25.
            </p>
          </div>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 xl:gap-8 w-full">
          <div className="executive-card text-center p-3 sm:p-4 md:p-6 lg:p-8 hover:scale-105 transition-transform duration-300">
            <div className="p-2 sm:p-3 lg:p-4 rounded-lg bg-success/10 text-success w-fit mx-auto mb-3 sm:mb-4">
              <Users className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10" />
            </div>
            <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-success mb-2">4.96M</div>
            <div className="text-sm sm:text-base lg:text-lg text-muted-foreground">Lives Impacted</div>
          </div>
          
          <div className="executive-card text-center p-3 sm:p-4 md:p-6 lg:p-8 hover:scale-105 transition-transform duration-300">
            <div className="p-2 sm:p-3 lg:p-4 rounded-lg bg-primary/10 text-primary w-fit mx-auto mb-3 sm:mb-4">
              <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10" />
            </div>
            <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-primary mb-2">367.5M</div>
            <div className="text-sm sm:text-base lg:text-lg text-muted-foreground">Meals Delivered</div>
          </div>
          
          <div className="executive-card text-center p-3 sm:p-4 md:p-6 lg:p-8 hover:scale-105 transition-transform duration-300">
            <div className="p-2 sm:p-3 lg:p-4 rounded-lg bg-warning/10 text-warning w-fit mx-auto mb-3 sm:mb-4">
              <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10" />
            </div>
            <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-warning mb-2">EGP 6.36</div>
            <div className="text-sm sm:text-base lg:text-lg text-muted-foreground">Cost Per Meal</div>
          </div>
          
          <div className="executive-card text-center p-3 sm:p-4 md:p-6 lg:p-8 hover:scale-105 transition-transform duration-300">
            <div className="p-2 sm:p-3 lg:p-4 rounded-lg bg-danger/10 text-danger w-fit mx-auto mb-3 sm:mb-4">
              <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10" />
            </div>
            <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-danger mb-2">GLOBAL #3</div>
            <div className="text-sm sm:text-base lg:text-lg text-muted-foreground">Largest Food Bank</div>
          </div>
        </div>

        {/* Action Button */}
        <div className="space-y-4 sm:space-y-6 lg:space-y-8 w-full">
          <Link to="/dashboard">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-2 sm:py-3 md:py-4 lg:py-6 text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-semibold hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
              Access Executive Dashboard
            </Button>
          </Link>
          
          <div className="flex items-center justify-center gap-2 sm:gap-3 lg:gap-4 xl:gap-6 flex-wrap w-full">
            <Badge variant="outline" className="text-success border-success text-xs sm:text-sm px-2 sm:px-3 md:px-4 py-1 sm:py-2 hover:bg-success/10 transition-colors">
              Real-time Analytics
            </Badge>
            <Badge variant="outline" className="text-primary border-primary text-xs sm:text-sm px-2 sm:px-3 md:px-4 py-1 sm:py-2 hover:bg-primary/10 transition-colors">
              Scenario Modeling
            </Badge>
            <Badge variant="outline" className="text-warning border-warning text-xs sm:text-sm px-2 sm:px-3 md:px-4 py-1 sm:py-2 hover:bg-warning/10 transition-colors">
              Financial Health
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
