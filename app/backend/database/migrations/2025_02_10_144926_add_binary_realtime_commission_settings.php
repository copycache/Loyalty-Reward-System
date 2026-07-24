<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddBinaryRealtimeCommissionSettings extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('tbl_membership', function (Blueprint $table) {
            $table->integer("binary_realtime_commission")->default(1);
            $table->integer("binary_waiting_commission_reset_days")->default(0);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('tbl_membership', function (Blueprint $table) {
            $table->dropColumn(['binary_realtime_commission', 'binary_waiting_commission_reset_days']);
        });
    }
}
